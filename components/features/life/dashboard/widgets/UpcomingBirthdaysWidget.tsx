import React from 'react';
import { useLifeStore } from '@/store/useLifeStore';
import { Gift, CalendarDays } from 'lucide-react';

interface UpcomingBirthdaysWidgetProps {
    onNavigate: (app: string, tab?: string) => void;
}

const UpcomingBirthdaysWidget: React.FC<UpcomingBirthdaysWidgetProps> = ({ onNavigate }) => {
    const { familyMembers } = useLifeStore();

    // Find upcoming birthdays in the next 30 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = familyMembers
        .filter(m => m.birthDate)
        .map(m => {
            const birthDate = new Date(m.birthDate!);
            const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

            if (nextBirthday < today) {
                nextBirthday.setFullYear(today.getFullYear() + 1);
            }

            const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            // Calculate age they will turn
            const ageTurn = nextBirthday.getFullYear() - birthDate.getFullYear();

            return { member: m, daysUntil, nextBirthday, ageTurn };
        })
        .filter(b => b.daysUntil <= 30)
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 2); // Show top 2

    const isBirthdaySoon = upcoming.length > 0 && upcoming[0].daysUntil <= 7;

    return (
        <div className="bg-white dark:bg-aliseus-900 p-6 rounded-3xl border border-aliseus-100 dark:border-aliseus-800 shadow-sm relative overflow-hidden h-full flex flex-col group cursor-pointer hover:shadow-md transition-all" onClick={() => onNavigate('life', 'family')}>
            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-2xl transition-colors ${isBirthdaySoon ? 'bg-fuchsia-500/10 group-hover:bg-fuchsia-500/20' : 'bg-blue-500/5 group-hover:bg-blue-500/10'}`}></div>

            <div className="flex justify-between items-start relative z-10 mb-4">
                <div className={`p-3 rounded-2xl shadow-inner ${isBirthdaySoon ? 'bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                    <Gift className="w-6 h-6" />
                </div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-center">
                <h4 className="text-[10px] font-black text-aliseus-400 dark:text-aliseus-500 uppercase tracking-widest mb-4">Próximos Cumpleaños</h4>

                {upcoming.length > 0 ? (
                    <div className="space-y-4">
                        {upcoming.map((b: any, i: number) => (
                            <div key={b.member.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {b.member.avatar ? (
                                        <img src={b.member.avatar} alt={b.member.name} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-aliseus-900 shadow-sm" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-aliseus-100 dark:bg-aliseus-800 flex items-center justify-center border-2 border-white dark:border-aliseus-900 shadow-sm text-aliseus-500 font-bold text-sm">
                                            {b.member.name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-sm text-aliseus-900 dark:text-white truncate max-w-[100px]">{b.member.name}</p>
                                        <p className="text-[10px] font-bold text-aliseus-400 uppercase tracking-widest">{b.ageTurn} años</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={`text-sm font-black ${b.daysUntil === 0 ? 'text-fuchsia-600 dark:text-fuchsia-400' : 'text-aliseus-900 dark:text-white'}`}>
                                        {b.daysUntil === 0 ? '¡Hoy!' : b.daysUntil === 1 ? 'Mañana' : `en ${b.daysUntil} d`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-2 h-full">
                        <CalendarDays className="w-6 h-6 text-aliseus-200 mb-2" />
                        <p className="text-[10px] font-bold text-aliseus-400 text-center uppercase tracking-widest max-w-[150px]">Sin cumpleaños en 30 días</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingBirthdaysWidget;
