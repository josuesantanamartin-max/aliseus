import React, { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { invitationService } from '../../services/invitationService';

interface InvitationInputProps {
    onValidCode: (code: string) => void;
    onInvalidCode?: (message: string) => void;
}

export const InvitationInput: React.FC<InvitationInputProps> = ({ onValidCode, onInvalidCode }) => {
    const [code, setCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationState, setValidationState] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const formatCode = (input: string): string => {
        // Remove all non-alphanumeric characters
        const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');

        // Add dashes every 4 characters
        const parts = [];
        for (let i = 0; i < cleaned.length; i += 4) {
            parts.push(cleaned.slice(i, i + 4));
        }

        return parts.join('-').slice(0, 14); // XXXX-XXXX-XXXX format
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCode(e.target.value);
        setCode(formatted);
        setValidationState('idle');
        setErrorMessage('');
    };

    const handleValidate = async () => {
        if (code.replace(/-/g, '').length !== 12) {
            setValidationState('invalid');
            setErrorMessage('El código debe tener 12 caracteres');
            return;
        }

        setIsValidating(true);
        setValidationState('idle');

        const result = await invitationService.validateCode(code);

        setIsValidating(false);

        if (result.valid) {
            setValidationState('valid');
            onValidCode(code);
        } else {
            setValidationState('invalid');
            setErrorMessage(result.message || 'Código inválido');
            if (onInvalidCode) {
                onInvalidCode(result.message || 'Código inválido');
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleValidate();
        }
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <input
                    type="text"
                    value={code}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="XXXX-XXXX-XXXX"
                    maxLength={14}
                    className={`w-full px-4 py-3 text-center text-lg font-mono tracking-wider rounded-lg border-2 transition-all outline-none ${validationState === 'valid'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : validationState === 'invalid'
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 dark:border-gray-600 focus:border-aliseus-500 dark:focus:border-aliseus-400'
                        } dark:bg-gray-800 dark:text-white`}
                    disabled={isValidating}
                />

                {/* Validation Icon */}
                {validationState !== 'idle' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {validationState === 'valid' ? (
                            <Check className="w-6 h-6 text-green-500" />
                        ) : (
                            <X className="w-6 h-6 text-red-500" />
                        )}
                    </div>
                )}
            </div>

            {/* Error Message */}
            {validationState === 'invalid' && errorMessage && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    {errorMessage}
                </p>
            )}

            {/* Validate Button */}
            <button
                onClick={handleValidate}
                disabled={isValidating || code.replace(/-/g, '').length !== 12}
                className="w-full py-3 bg-aliseus-600 hover:bg-aliseus-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                {isValidating ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Validando...
                    </>
                ) : (
                    'Validar Código'
                )}
            </button>

            {/* Success Message */}
            {validationState === 'valid' && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300 text-center font-medium">
                        ✓ Código válido. Puedes continuar con el registro.
                    </p>
                </div>
            )}

            {/* Help Text */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Introduce el código de invitación que recibiste por email
            </p>
        </div>
    );
};
