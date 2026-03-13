import { get, set, del } from 'idb-keyval';
import { StateStorage } from 'zustand/middleware';

/**
 * Zustand storage adapter for IndexedDB using idb-keyval.
 * Provides asynchronous, non-blocking, and high-capacity storage
 * for hybrid offline-first state management.
 */
export const idbStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        const value = await get(name);
        return value || null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await set(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await del(name);
    },
};
