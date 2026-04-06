import React, { useState } from 'react';
import { Logo } from '../Logo';
import { PaymentMethods } from '../../common/PaymentMethods';
import { LegalPage } from '../../legal/LegalPage';

interface LandingFooterProps {
    onNavigate: (view: 'HOME' | 'FINANCE' | 'LIFE') => void;
    t: any;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onNavigate, t }) => {
    const [showLegalModal, setShowLegalModal] = useState<'privacy' | 'terms' | null>(null);

    return (
        <>
            {showLegalModal && (
                <LegalPage
                    document={showLegalModal}
                    onClose={() => setShowLegalModal(null)}
                />
            )}

            <footer className="py-12 px-6 border-t border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => onNavigate('HOME')}>
                        <Logo className="h-8 w-auto group-hover:scale-105 transition-all duration-300 drop-shadow-sm" />
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <PaymentMethods variant="grayscale" className="opacity-60 scale-90" />
                        <div className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Aliseus. La tranquilidad de tu familia.</div>
                    </div>
                    <div className="flex gap-6 text-sm font-medium text-gray-600">
                        <button
                            onClick={() => setShowLegalModal('privacy')}
                            className="hover:text-black transition-colors"
                        >
                            {t.footerPrivacy}
                        </button>
                        <button
                            onClick={() => setShowLegalModal('terms')}
                            className="hover:text-black transition-colors"
                        >
                            {t.footerTerms}
                        </button>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-black">{t.footerTwitter}</a>
                    </div>
                </div>
            </footer>
        </>
    );
};
