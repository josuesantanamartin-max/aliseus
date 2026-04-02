import React from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Coins, Banknote, PoundSterling, Check } from 'lucide-react';

const CurrencyOption = ({
    code,
    symbol,
    name,
    selected,
    onSelect
}: {
    code: string;
    symbol: string;
    name: string;
    selected: boolean;
    onSelect: () => void;
}) => (
    <div
        onClick={onSelect}
        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${selected
            ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20'
            : 'border-gray-100 dark:border-onyx-800 bg-white dark:bg-onyx-800 hover:border-cyan-200 dark:hover:border-cyan-800'
            }`}
    >
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${selected ? 'bg-cyan-600 text-white' : 'bg-gray-100 dark:bg-onyx-700 text-gray-500'
                }`}>
                {symbol}
            </div>
            <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{code}</h3>
                <p className="text-sm text-gray-500">{name}</p>
            </div>
        </div>

        {selected && (
            <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
            </div>
        )}
    </div>
);

const CurrencyStep: React.FC = () => {
    const { currency, setCurrency, setOnboardingStep, userProfile } = useUserStore();

    const handleBack = () => {
        // Sequence: FocusPicker(7) → [FamilySetup(3)?] → Currency(4)
        // Always go back to FamilySetup if isFamily, otherwise to FocusPicker(7)
        const isFamily = userProfile?.persona_type?.some(p => p === 'FAMILY' || p === 'COUPLE');
        setOnboardingStep(isFamily ? 3 : 7);
    };

    return (
        <div className="flex flex-col items-center animate-fade-in-up w-full max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 text-center">
                Moneda Principal
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">
                Elige la moneda para Aliseus. Podrás añadir cuentas en otras monedas más tarde.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-10 max-h-[50vh] overflow-y-auto p-2">
                <CurrencyOption code="EUR" symbol="€" name="Euro" selected={currency === 'EUR'} onSelect={() => setCurrency('EUR')} />
                <CurrencyOption code="USD" symbol="$" name="Dólar Estadounidense" selected={currency === 'USD'} onSelect={() => setCurrency('USD')} />
                <CurrencyOption code="GBP" symbol="£" name="Libra Esterlina" selected={currency === 'GBP'} onSelect={() => setCurrency('GBP')} />
                <CurrencyOption code="MXN" symbol="$" name="Peso Mexicano" selected={currency === 'MXN'} onSelect={() => setCurrency('MXN')} />
                <CurrencyOption code="COP" symbol="$" name="Peso Colombiano" selected={currency === 'COP'} onSelect={() => setCurrency('COP')} />
                <CurrencyOption code="ARS" symbol="$" name="Peso Argentino" selected={currency === 'ARS'} onSelect={() => setCurrency('ARS')} />
                <CurrencyOption code="CLP" symbol="$" name="Peso Chileno" selected={currency === 'CLP'} onSelect={() => setCurrency('CLP')} />
                <CurrencyOption code="CHF" symbol="CHF" name="Franco Suizo" selected={currency === 'CHF'} onSelect={() => setCurrency('CHF')} />
                <CurrencyOption code="CAD" symbol="$" name="Dólar Canadiense" selected={currency === 'CAD'} onSelect={() => setCurrency('CAD')} />
                <CurrencyOption code="AUD" symbol="$" name="Dólar Australiano" selected={currency === 'AUD'} onSelect={() => setCurrency('AUD')} />
                <CurrencyOption code="INR" symbol="₹" name="Rupia India" selected={currency === 'INR'} onSelect={() => setCurrency('INR')} />
            </div>

            <div className="flex justify-between w-full max-w-md">
                <button
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                >
                    Atrás
                </button>

                <button
                    onClick={() => setOnboardingStep(5)} // Next is Accounts (Step 5)
                    className="px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold shadow-lg hover:bg-cyan-700 hover:scale-105 transition-all"
                >
                    Continuar
                </button>
            </div>
        </div>
    );
};

export default CurrencyStep;
