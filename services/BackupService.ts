import { supabase } from '../services/supabaseClient';

export interface BackupMetadata {
    id: string;
    userId: string;
    timestamp: string;
    size: number;
    version: string;
    dataTypes: string[];
}

export interface BackupConfig {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retention: number; // Number of backups to keep
    lastBackup?: string;
    autoBackup: boolean;
}

export interface BackupData {
    version: string;
    timestamp: string;
    userId: string;
    data: {
        transactions?: any[];
        budgets?: any[];
        accounts?: any[];
        goals?: any[];
        debts?: any[];
        recipes?: any[];
        weeklyPlans?: any[];
        trips?: any[];
        settings?: any;
        dashboardLayouts?: any[];
    };
}

/**
 * BackupService - Manages automatic and manual backups
 */
export class BackupService {
    private static readonly BACKUP_VERSION = '1.0.0';
    private static readonly STORAGE_KEY = 'Aliseus_backup_config';
    private static readonly LOCAL_BACKUP_KEY = 'Aliseus_local_backups';

    /**
     * Get backup configuration
     */
    static getConfig(): BackupConfig {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }

        // Default configuration
        return {
            enabled: false,
            frequency: 'weekly',
            retention: 5,
            autoBackup: false
        };
    }

    /**
     * Update backup configuration
     */
    static updateConfig(config: Partial<BackupConfig>): void {
        const current = this.getConfig();
        const updated = { ...current, ...config };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    }

    /**
     * Create a complete backup of user data
     */
    static async createBackup(userId: string): Promise<BackupMetadata | null> {
        try {
            console.log('Creating backup for user:', userId);

            // Gather all user data from Supabase
            const backupData: BackupData = {
                version: this.BACKUP_VERSION,
                timestamp: new Date().toISOString(),
                userId,
                data: {}
            };

            // Fetch transactions
            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId);
            if (transactions) backupData.data.transactions = transactions;

            // Fetch budgets
            const { data: budgets } = await supabase
                .from('budgets')
                .select('*')
                .eq('user_id', userId);
            if (budgets) backupData.data.budgets = budgets;

            // Fetch accounts
            const { data: accounts } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', userId);
            if (accounts) backupData.data.accounts = accounts;

            // Fetch goals
            const { data: goals } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', userId);
            if (goals) backupData.data.goals = goals;

            // Fetch debts
            const { data: debts } = await supabase
                .from('debts')
                .select('*')
                .eq('user_id', userId);
            if (debts) backupData.data.debts = debts;

            // Fetch recipes
            const { data: recipes } = await supabase
                .from('recipes')
                .select('*')
                .eq('user_id', userId);
            if (recipes) backupData.data.recipes = recipes;

            // Fetch weekly plans
            const { data: weeklyPlans } = await supabase
                .from('weekly_plans')
                .select('*')
                .eq('user_id', userId);
            if (weeklyPlans) backupData.data.weeklyPlans = weeklyPlans;

            // Fetch trips
            const { data: trips } = await supabase
                .from('trips')
                .select('*')
                .eq('user_id', userId);
            if (trips) backupData.data.trips = trips;

            // Fetch dashboard layouts
            const { data: dashboardLayouts } = await supabase
                .from('user_dashboard_layouts')
                .select('*')
                .eq('user_id', userId);
            if (dashboardLayouts) backupData.data.dashboardLayouts = dashboardLayouts;

            // Create backup metadata
            const metadata: BackupMetadata = {
                id: `backup_${Date.now()}`,
                userId,
                timestamp: backupData.timestamp,
                size: JSON.stringify(backupData).length,
                version: this.BACKUP_VERSION,
                dataTypes: Object.keys(backupData.data).filter(key => backupData.data[key as keyof typeof backupData.data])
            };

            // Save to local storage
            await this.saveLocalBackup(metadata, backupData);

            // Update last backup time
            this.updateConfig({ lastBackup: new Date().toISOString() });

            // Clean old backups based on retention policy
            await this.cleanOldBackups();

            console.log('Backup created successfully:', metadata);
            return metadata;

        } catch (error) {
            console.error('Error creating backup:', error);
            return null;
        }
    }

    /**
     * Save backup to local storage
     */
    private static async saveLocalBackup(metadata: BackupMetadata, data: BackupData): Promise<void> {
        try {
            const backups = this.getLocalBackups();
            backups.push({
                metadata,
                data
            });
            localStorage.setItem(this.LOCAL_BACKUP_KEY, JSON.stringify(backups));
        } catch (error) {
            console.error('Error saving local backup:', error);
            throw error;
        }
    }

    /**
     * Get all local backups
     */
    static getLocalBackups(): Array<{ metadata: BackupMetadata; data: BackupData }> {
        try {
            const stored = localStorage.getItem(this.LOCAL_BACKUP_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading local backups:', error);
            return [];
        }
    }

    /**
     * Get backup metadata list
     */
    static getBackupList(): BackupMetadata[] {
        const backups = this.getLocalBackups();
        return backups.map(b => b.metadata).sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }

    /**
     * Restore from backup
     */
    static async restoreBackup(backupId: string, userId: string): Promise<boolean> {
        try {
            console.log('Restoring backup:', backupId);

            const backups = this.getLocalBackups();
            const backup = backups.find(b => b.metadata.id === backupId);

            if (!backup) {
                console.error('Backup not found:', backupId);
                return false;
            }

            // Verify user ID matches
            if (backup.metadata.userId !== userId) {
                console.error('User ID mismatch');
                return false;
            }

            const { data } = backup;

            // Restore transactions
            if (data.data.transactions && data.data.transactions.length > 0) {
                await supabase.from('transactions').delete().eq('user_id', userId);
                await supabase.from('transactions').insert(data.data.transactions);
            }

            // Restore budgets
            if (data.data.budgets && data.data.budgets.length > 0) {
                await supabase.from('budgets').delete().eq('user_id', userId);
                await supabase.from('budgets').insert(data.data.budgets);
            }

            // Restore accounts
            if (data.data.accounts && data.data.accounts.length > 0) {
                await supabase.from('accounts').delete().eq('user_id', userId);
                await supabase.from('accounts').insert(data.data.accounts);
            }

            // Restore goals
            if (data.data.goals && data.data.goals.length > 0) {
                await supabase.from('goals').delete().eq('user_id', userId);
                await supabase.from('goals').insert(data.data.goals);
            }

            // Restore debts
            if (data.data.debts && data.data.debts.length > 0) {
                await supabase.from('debts').delete().eq('user_id', userId);
                await supabase.from('debts').insert(data.data.debts);
            }

            // Restore recipes
            if (data.data.recipes && data.data.recipes.length > 0) {
                await supabase.from('recipes').delete().eq('user_id', userId);
                await supabase.from('recipes').insert(data.data.recipes);
            }

            // Restore weekly plans
            if (data.data.weeklyPlans && data.data.weeklyPlans.length > 0) {
                await supabase.from('weekly_plans').delete().eq('user_id', userId);
                await supabase.from('weekly_plans').insert(data.data.weeklyPlans);
            }

            // Restore trips
            if (data.data.trips && data.data.trips.length > 0) {
                await supabase.from('trips').delete().eq('user_id', userId);
                await supabase.from('trips').insert(data.data.trips);
            }

            // Restore dashboard layouts
            if (data.data.dashboardLayouts && data.data.dashboardLayouts.length > 0) {
                await supabase.from('user_dashboard_layouts').delete().eq('user_id', userId);
                await supabase.from('user_dashboard_layouts').insert(data.data.dashboardLayouts);
            }

            console.log('Backup restored successfully');
            return true;

        } catch (error) {
            console.error('Error restoring backup:', error);
            return false;
        }
    }

    /**
     * Delete a specific backup
     */
    static deleteBackup(backupId: string): boolean {
        try {
            const backups = this.getLocalBackups();
            const filtered = backups.filter(b => b.metadata.id !== backupId);
            localStorage.setItem(this.LOCAL_BACKUP_KEY, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Error deleting backup:', error);
            return false;
        }
    }

    /**
     * Clean old backups based on retention policy
     */
    private static async cleanOldBackups(): Promise<void> {
        try {
            const config = this.getConfig();
            const backups = this.getLocalBackups();

            if (backups.length > config.retention) {
                // Sort by timestamp (newest first)
                const sorted = backups.sort((a, b) =>
                    new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime()
                );

                // Keep only the newest N backups
                const toKeep = sorted.slice(0, config.retention);
                localStorage.setItem(this.LOCAL_BACKUP_KEY, JSON.stringify(toKeep));

                console.log(`Cleaned old backups, kept ${toKeep.length} of ${backups.length}`);
            }
        } catch (error) {
            console.error('Error cleaning old backups:', error);
        }
    }

    /**
     * Check if automatic backup is needed
     */
    static shouldCreateBackup(): boolean {
        const config = this.getConfig();

        if (!config.enabled || !config.autoBackup) {
            return false;
        }

        if (!config.lastBackup) {
            return true;
        }

        const lastBackup = new Date(config.lastBackup);
        const now = new Date();
        const diffMs = now.getTime() - lastBackup.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        switch (config.frequency) {
            case 'daily':
                return diffDays >= 1;
            case 'weekly':
                return diffDays >= 7;
            case 'monthly':
                return diffDays >= 30;
            default:
                return false;
        }
    }

    /**
     * Download backup as JSON file
     */
    static downloadBackup(backupId: string): void {
        try {
            const backups = this.getLocalBackups();
            const backup = backups.find(b => b.metadata.id === backupId);

            if (!backup) {
                console.error('Backup not found');
                return;
            }

            const dataStr = JSON.stringify(backup.data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `aliseus-backup-${backup.metadata.timestamp}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log('Backup downloaded successfully');
        } catch (error) {
            console.error('Error downloading backup:', error);
        }
    }

    /**
     * Format backup size for display
     */
    static formatSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    /**
     * Format timestamp for display
     */
    static formatTimestamp(timestamp: string): string {
        const date = new Date(timestamp);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
