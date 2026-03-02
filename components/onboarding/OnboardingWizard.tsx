import React from 'react';
import { useUserStore } from '../../store/useUserStore';
import OnboardingLayout from './OnboardingLayout';
import WelcomeStep from './steps/WelcomeStep';
import { MagicDemoStep } from './steps/MagicDemoStep';
import ProfileSelectionStep from './steps/ProfileSelectionStep';
import FamilySetupStep from './steps/FamilySetupStep';
import CurrencyStep from './steps/CurrencyStep';
import AccountsStep from './steps/AccountsStep';
import ImportDataStep from './steps/ImportDataStep';

const OnboardingWizard: React.FC = () => {
    const { onboardingStep, userProfile, subscription } = useUserStore();

    const isFamilyPlan = subscription.plan === 'FAMILIA';
    const hasFamilyPersona = userProfile?.persona_type?.some(p => p === 'FAMILY' || p === 'COUPLE');
    const isFamily = isFamilyPlan || hasFamilyPersona;

    // Calculate active steps to ensure consecutive numbering (Paso 1, 2, 3...)
    // Steps: 1: Demo, 2: Profile, 3: Family (Conditional), 4: Currency, 5: Accounts, 6: Import
    const activeSteps = [1, 2, isFamily ? 3 : null, 4, 5, 6].filter(Boolean) as number[];
    const displayStep = activeSteps.indexOf(onboardingStep) + 1;
    const totalStepsDisplay = activeSteps.length;

    const renderStep = () => {
        switch (onboardingStep) {
            case 0: return <WelcomeStep />;
            case 1: return <MagicDemoStep />;
            case 2: return <ProfileSelectionStep />;
            case 3: return <FamilySetupStep />;
            case 4: return <CurrencyStep />;
            case 5: return <AccountsStep />;
            case 6: return <ImportDataStep />;
            default: return <WelcomeStep />;
        }
    };

    return (
        <OnboardingLayout>
            <div className="flex-1 flex flex-col justify-center items-center w-full">
                {/* Progress Bar (Hidden on Welcome Step) */}
                {onboardingStep > 0 && (
                    <div className="w-full max-w-xl mb-8 flex items-center gap-2 animate-fade-in">
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-onyx-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyan-600 transition-all duration-500 ease-out"
                                style={{ width: `${(displayStep / totalStepsDisplay) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-gray-400">
                            Paso {displayStep} de {totalStepsDisplay}
                        </span>
                    </div>
                )}

                {renderStep()}

            </div>
        </OnboardingLayout>
    );
};

export default OnboardingWizard;
