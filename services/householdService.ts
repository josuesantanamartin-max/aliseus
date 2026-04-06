import { supabase } from './supabaseClient';
import { Household, HouseholdMember, PermissionMatrix } from '../types';
import { CreateHouseholdInput } from '../schemas/household.schema';

export const householdService = {
    /**
     * Create a new household with the current user as owner and admin.
     */
    async createHousehold(data: CreateHouseholdInput) {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data: householdId, error } = await supabase.rpc('create_new_household', {
            household_name: data.name,
            household_currency: data.currency,
        });

        if (error) throw error;
        return householdId;
    },

    /**
     * Get all households the current user is a member of.
     */
    async getMyHouseholds() {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('households')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Household[];
    },

    /**
     * Get members of a specific household.
     */
    async getHouseholdMembers(householdId: string) {
        if (!supabase) throw new Error('Supabase client not initialized');

        // Read from secure view
        const { data, error } = await supabase
            .from('vw_household_members')
            .select('*')
            .eq('household_id', householdId);

        if (error) throw error;
        return data;
    },

    /**
     * Invite a user to the household by email.
     */
    async inviteMember(householdId: string, email: string, role: string) {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('household_invites')
            .insert({
                household_id: householdId,
                email: email.toLowerCase().trim(),
                role,
                created_by: user.user.id
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Accept an invitation using its token.
     */
    async acceptInvitation(token: string) {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('Not authenticated');

        // 1. Fetch the invitation
        const { data: invite, error: fetchError } = await supabase
            .from('household_invites')
            .select('*')
            .eq('token', token)
            .eq('status', 'PENDING')
            .single();

        if (fetchError || !invite) throw new Error('Invitación no válida o expirada.');

        // Security check: email matches
        if (invite.email !== user.user.email) {
            throw new Error('Esta invitación fue enviada a otro correo electrónico.');
        }

        // 2. Add user to household
        const { error: insertError } = await supabase
            .from('household_members')
            .insert({
                household_id: invite.household_id,
                user_id: user.user.id,
                role: invite.role
            });

        if (insertError) throw insertError;

        // 3. Update invite status
        await supabase
            .from('household_invites')
            .update({ status: 'ACCEPTED' })
            .eq('id', invite.id);

        return invite.household_id;
    },

    /**
     * Update household permissions.
     */
    async updatePermissions(householdId: string, permissions: PermissionMatrix) {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { error } = await supabase
            .from('households')
            .update({ permissions })
            .eq('id', householdId);

        if (error) throw error;
    },

    /**
     * Leave a household
     */
    async leaveHousehold(householdId: string) {
        if (!supabase) throw new Error('Supabase client not initialized');
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (!userId) throw new Error('User not found');

        const { error } = await supabase
            .from('household_members')
            .delete()
            .eq('household_id', householdId)
            .eq('user_id', userId);

        if (error) throw error;
    },

    /**
     * Send a chat message to the household
     */
    async sendMessage(householdId: string, content: string) {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { error } = await supabase
            .from('household_messages')
            .insert({
                household_id: householdId,
                content,
                user_id: (await supabase.auth.getUser()).data.user?.id
            });

        if (error) throw error;
    },

    /**
     * Get recent messages for the household
     */
    async getMessages(householdId: string, limit = 50) {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('household_messages')
            .select('*, user:user_id(email, user_metadata)')
            .eq('household_id', householdId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }
};

