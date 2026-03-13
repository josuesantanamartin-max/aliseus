import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthGate from '../AuthGate';

// Mock all dependencies
vi.mock('../../services/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
            onAuthStateChange: vi.fn(() => ({
                data: { subscription: { unsubscribe: vi.fn() } }
            }))
        }
    }
}));

vi.mock('../../store/useUserStore', () => ({
    useUserStore: vi.fn()
}));

vi.mock('../../store/useFinanceStore', () => ({
    useFinanceStore: vi.fn(() => ({
        loadFromCloud: vi.fn()
    }))
}));

vi.mock('../layout/AliseusLanding', () => ({
    default: ({ onLogin }: any) => <div data-testid="onyx-landing">Landing Page</div>
}));

vi.mock('../onboarding/OnboardingWizard', () => ({
    default: () => <div data-testid="onboarding-wizard">Onboarding</div>
}));

import { useUserStore } from '../../../store/useUserStore';

const screen = {
    getByTestId: (id: string) => document.querySelector(`[data-testid="${id}"]`),
    getByText: (text: string | RegExp) => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.find(el => {
            const content = el.textContent || '';
            return typeof text === 'string' ? content.includes(text) : text.test(content);
        });
    },
    queryByText: (text: string) => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.find(el => el.textContent?.includes(text)) || null;
    },
    queryByTestId: (id: string) => document.querySelector(`[data-testid="${id}"]`)
};

describe('AuthGate Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render landing page when not authenticated', () => {
        (useUserStore as any).mockReturnValue({
            isAuthenticated: false,
            isDemoMode: false,
            language: 'ES',
            setAuthenticated: vi.fn(),
            setDemoMode: vi.fn(),
            setLanguage: vi.fn(),
            addSyncLog: vi.fn(),
            setUserProfile: vi.fn(),
            hasCompletedOnboarding: false
        });

        render(<AuthGate><div>Protected</div></AuthGate>);

        expect(screen.getByTestId('onyx-landing')).toBeInTheDocument();
        expect(screen.queryByText('Protected')).not.toBeInTheDocument();
    });

    it('should render onboarding when authenticated but not completed', () => {
        (useUserStore as any).mockReturnValue({
            isAuthenticated: true,
            isDemoMode: false,
            language: 'ES',
            setAuthenticated: vi.fn(),
            setDemoMode: vi.fn(),
            setLanguage: vi.fn(),
            addSyncLog: vi.fn(),
            setUserProfile: vi.fn(),
            hasCompletedOnboarding: false
        });

        render(<AuthGate><div>Protected</div></AuthGate>);

        expect(screen.getByTestId('onboarding-wizard')).toBeInTheDocument();
        expect(screen.queryByText('Protected')).not.toBeInTheDocument();
    });

    it('should render children when authenticated and onboarding completed', () => {
        (useUserStore as any).mockReturnValue({
            isAuthenticated: true,
            isDemoMode: false,
            language: 'ES',
            setAuthenticated: vi.fn(),
            setDemoMode: vi.fn(),
            setLanguage: vi.fn(),
            addSyncLog: vi.fn(),
            setUserProfile: vi.fn(),
            hasCompletedOnboarding: true
        });

        render(<AuthGate><div>Protected Content</div></AuthGate>);

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        expect(screen.queryByTestId('onyx-landing')).not.toBeInTheDocument();
        expect(screen.queryByTestId('onboarding-wizard')).not.toBeInTheDocument();
    });

    it('should render children in demo mode with onboarding completed', () => {
        (useUserStore as any).mockReturnValue({
            isAuthenticated: true,
            isDemoMode: true,
            language: 'ES',
            setAuthenticated: vi.fn(),
            setDemoMode: vi.fn(),
            setLanguage: vi.fn(),
            addSyncLog: vi.fn(),
            setUserProfile: vi.fn(),
            hasCompletedOnboarding: true
        });

        render(<AuthGate><div>Demo Content</div></AuthGate>);

        expect(screen.getByText('Demo Content')).toBeInTheDocument();
    });

    it('should handle multiple authentication states correctly', () => {
        const mockStore = {
            isAuthenticated: false,
            isDemoMode: false,
            language: 'ES',
            setAuthenticated: vi.fn(),
            setDemoMode: vi.fn(),
            setLanguage: vi.fn(),
            addSyncLog: vi.fn(),
            setUserProfile: vi.fn(),
            hasCompletedOnboarding: false
        };

        (useUserStore as any).mockReturnValue(mockStore);

        const { rerender } = render(<AuthGate><div>Content</div></AuthGate>);
        expect(screen.getByTestId('onyx-landing')).toBeInTheDocument();

        // Simulate authentication
        mockStore.isAuthenticated = true;
        mockStore.hasCompletedOnboarding = true;
        (useUserStore as any).mockReturnValue(mockStore);

        rerender(<AuthGate><div>Content</div></AuthGate>);
        expect(screen.getByText('Content')).toBeInTheDocument();
    });
});
