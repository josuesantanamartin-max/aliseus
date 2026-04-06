import React from 'react';
import { motion } from 'framer-motion';
import { HouseholdManager } from '../../collaboration/HouseholdManager';
import { MemberManagement } from '../../collaboration/MemberManagement';
import { HouseholdChat } from '../../collaboration/HouseholdChat';

export const FamilyPanel = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
        >
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-1.5 h-10 bg-indigo-500 rounded-full" />
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Gestión Colaborativa</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl">
                    Administra los miembros de tu hogar, cambia entre diferentes entornos familiares y comunícate de forma segura.
                </p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr,1fr] gap-10">
                <div className="space-y-10">
                    <HouseholdManager />
                    <MemberManagement />
                </div>
                <div className="bg-white dark:bg-aliseus-900 rounded-[40px] shadow-2xl shadow-indigo-500/5 border border-gray-100 dark:border-aliseus-800 overflow-hidden ring-1 ring-black/5">
                    <HouseholdChat />
                </div>
            </div>
        </motion.div>
    );
};
