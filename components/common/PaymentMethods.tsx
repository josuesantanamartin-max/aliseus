import React from 'react';

interface PaymentMethodsProps {
    className?: string;
    variant?: 'light' | 'dark' | 'grayscale';
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({ className = '', variant = 'light' }) => {
    const logos = [
        { name: 'Visa', url: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Visa_Inc._logo_%282021%E2%80%93present%29.svg', height: 'h-7' },
        { name: 'Mastercard', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg', height: 'h-7' },
        { name: 'American Express', url: 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg', height: 'h-7' },
        { name: 'Apple Pay', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg', height: 'h-6' },
        { name: 'Google Pay', url: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg', height: 'h-7' },
        { name: 'Amazon Pay', url: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Amazon_Pay_logo.svg', height: 'h-7' },
        { name: 'Klarna', url: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Klarna_Payment_Badge.svg', height: 'h-8' },
        { name: 'Revolut Pay', url: 'https://cdn.brandfetch.io/idkTaHd18D/theme/dark/idA47UgkyM.svg?k=bf-REvI9_v5KivL-y-p', height: 'h-10' },
    ];

    const filterClass = (() => {
        switch (variant) {
            case 'grayscale':
                return 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100 invert dark:invert-0';
            case 'dark':
                return 'brightness-0 invert opacity-70 hover:opacity-100';
            default:
                return 'opacity-80 hover:opacity-100';
        }
    })();

    return (
        <div className={`flex flex-wrap items-center justify-center gap-x-8 gap-y-6 ${className}`}>
            {logos.map((logo) => (
                <div 
                    key={logo.name}
                    className="flex items-center justify-center transition-transform duration-300 hover:scale-110"
                >
                    <img
                        src={logo.url}
                        alt={logo.name}
                        className={`${logo.height} w-auto object-contain transition-all duration-300 ${filterClass}`}
                        title={logo.name}
                    />
                </div>
            ))}
        </div>
    );
};
