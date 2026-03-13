import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceAction, VoiceState, VoiceActionType } from '../types';
import { processVoiceCommand } from '../services/geminiCore';
import { useUserStore } from '../store/useUserStore';

// Web Speech API interfaces
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
}

interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition } | undefined;
        webkitSpeechRecognition: { new(): SpeechRecognition } | undefined;
    }
}

export const useVoiceAssistant = () => {
    const { language } = useUserStore();
    const [state, setState] = useState<VoiceState>({
        isListening: false,
        isProcessing: false,
        lastTranscript: null,
        lastAction: null,
        error: null
    });

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Initialize Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false; // Process one command at a time
            recognition.interimResults = false;

            // Map Aliseus 'ES' to 'es-ES', etc.
            const langMap = { 'ES': 'es-ES', 'EN': 'en-US', 'FR': 'fr-FR' };
            recognition.lang = langMap[language] || 'es-ES';

            recognition.onresult = async (event: SpeechRecognitionEvent) => {
                const transcript = event.results[0][0].transcript;
                setState(prev => ({ ...prev, isListening: false, isProcessing: true, lastTranscript: transcript }));

                try {
                    const action = await processVoiceCommand(transcript, language);
                    setState(prev => ({
                        ...prev,
                        isProcessing: false,
                        lastAction: action,
                        error: null
                    }));

                    // Optional: Speak confirmation
                    if (action.type !== 'UNKNOWN') {
                        speak(`Entendido. Ejecutando acción: ${action.type}`);
                    } else {
                        speak("Lo siento, no he entendido el comando.");
                    }

                } catch (e: any) {
                    setState(prev => ({ ...prev, isProcessing: false, error: "Error processing command" }));
                }
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                setState(prev => ({ ...prev, isListening: false, error: event.error }));
            };

            recognitionRef.current = recognition;
        } else {
            setState(prev => ({ ...prev, error: "Browser not supported" }));
        }
    }, [language]);

    const listen = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setState(prev => ({ ...prev, isListening: true, lastTranscript: null, lastAction: null, error: null }));
            } catch (e) {
                // If already started, stop first
                recognitionRef.current.stop();
            }
        }
    }, []);

    const stop = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setState(prev => ({ ...prev, isListening: false }));
        }
    }, []);

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            // Default generic voice
            window.speechSynthesis.speak(utterance);
        }
    };

    return {
        ...state,
        listen,
        stop,
        speak
    };
};
