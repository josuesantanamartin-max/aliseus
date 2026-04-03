import { useEffect, useRef, useCallback } from 'react';
import { useUserStore } from '../store/useUserStore';
import { DashboardLayout } from '../types';

/**
 * useDashboardSync — stub hasta que dashboardLayouts/saveLayout/setActiveLayout
 * se implementen completamente en useUserStore.
 * El hook existe para no romper imports existentes.
 */
export const useDashboardSync = () => {
    const { userProfile } = useUserStore();

    const loadLayouts = useCallback(async () => {
        // TODO: implementar cuando useUserStore tenga dashboardLayouts
    }, [userProfile]);

    const syncToSupabase = useCallback((_layouts: DashboardLayout[]) => {
        // TODO: implementar cuando useUserStore tenga dashboardLayouts
    }, [userProfile]);

    useEffect(() => {
        loadLayouts();
    }, [loadLayouts]);

    return {
        loadLayouts,
        syncToSupabase,
    };
};
