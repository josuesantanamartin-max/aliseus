import React, { useState } from 'react';
import { useLifeStore } from '@/store/useLifeStore';
import { useUserStore } from '@/store/useUserStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Trip } from '@/types';
import { GlobalMapModal } from './travel/GlobalMapModal';
import { TravelHub } from './travel/TravelHub';
import { TripDetails } from './travel/TripDetails';
import { NewTripModal } from './travel/NewTripModal';

interface TravelModuleProps {}

const TravelModule: React.FC<TravelModuleProps> = () => {
    const { trips, setTrips } = useLifeStore();
    const { language } = useUserStore();
    const { currency } = useFinanceStore();

    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
    const [isNewTripOpen, setIsNewTripOpen] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    const selectedTrip = trips.find(t => t.id === selectedTripId);

    const handleSaveNewTrip = (newTrip: Trip, createLinkedGoal: boolean) => {
        let finalTrip = { ...newTrip };

        if (createLinkedGoal) {
            const goalId = Math.random().toString(36).substr(2, 9);
            finalTrip.linkedGoalId = goalId;
            
            const newGoal = {
                id: goalId,
                name: `Viaje a ${finalTrip.destination}`,
                targetAmount: finalTrip.budget,
                currentAmount: 0,
                deadline: finalTrip.startDate,
                linkedTripId: finalTrip.id
            };
            
            useFinanceStore.getState().addGoal(newGoal);
        }

        setTrips([...trips, finalTrip]);
        setIsNewTripOpen(false);
    };

    return (
        <div className="h-full bg-[#FAFAFA] relative">
            {!selectedTripId ? (
                <TravelHub 
                    trips={trips} 
                    currency={currency as string} 
                    onOpenMap={() => setIsMapModalOpen(true)}
                    onNewTrip={() => setIsNewTripOpen(true)}
                    onSelectTrip={(id) => setSelectedTripId(id)}
                />
            ) : (
                <TripDetails 
                    trip={selectedTrip!} 
                    currency={currency as string} 
                    onBack={() => setSelectedTripId(null)}
                />
            )}

            <NewTripModal 
                isOpen={isNewTripOpen}
                onClose={() => setIsNewTripOpen(false)}
                onSaveDialog={handleSaveNewTrip}
                language={language as any}
                currency={currency as string}
            />

            <GlobalMapModal 
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                trips={trips}
            />
        </div>
    );
};

export default TravelModule;
