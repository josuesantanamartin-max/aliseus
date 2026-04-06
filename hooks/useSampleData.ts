import { useState, useEffect } from 'react';
import { SampleDataService } from '../services/SampleDataService';

interface UseSampleDataReturn {
    isSampleDataLoaded: boolean;
    hasUserData: boolean;
    isBannerDismissed: boolean;
    loadSampleData: () => void;
    clearAllData: (keepRecipes?: boolean) => void;
    restoreSampleData: () => void;
    dismissBanner: () => void;
    isLoading: boolean;
}

/**
 * Hook to manage sample data state and operations
 */
export const useSampleData = (): UseSampleDataReturn => {
    const [isSampleDataLoaded, setIsSampleDataLoaded] = useState(false);
    const [hasUserData, setHasUserData] = useState(false);
    const [isBannerDismissed, setIsBannerDismissed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check initial state on mount
    useEffect(() => {
        checkDataState();
    }, []);

    const checkDataState = () => {
        const sampleLoaded = SampleDataService.isSampleDataLoaded();
        const userData = SampleDataService.detectIfUserHasData();
        const dismissed = SampleDataService.isSampleDataDismissed();

        setIsSampleDataLoaded(sampleLoaded);
        setHasUserData(userData);
        setIsBannerDismissed(dismissed);
    };

    const loadSampleData = () => {
        setIsLoading(true);
        try {
            SampleDataService.loadSampleData();
            checkDataState();
        } finally {
            setIsLoading(false);
        }
    };

    const clearAllData = (keepRecipes: boolean = true) => {
        setIsLoading(true);
        try {
            SampleDataService.clearAllData(keepRecipes);
            checkDataState();
        } finally {
            setIsLoading(false);
        }
    };

    const restoreSampleData = () => {
        setIsLoading(true);
        try {
            SampleDataService.restoreSampleData();
            checkDataState();
        } finally {
            setIsLoading(false);
        }
    };

    const dismissBanner = () => {
        SampleDataService.dismissSampleDataBanner();
        setIsBannerDismissed(true);
    };

    return {
        isSampleDataLoaded,
        hasUserData,
        isBannerDismissed,
        loadSampleData,
        clearAllData,
        restoreSampleData,
        dismissBanner,
        isLoading,
    };
};
