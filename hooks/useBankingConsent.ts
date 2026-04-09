import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';

export type ConsentUrgency = 'safe' | 'warning' | 'critical' | 'expired';

export interface BankingConsentStatus {
  isLinked: boolean;
  daysRemaining: number | null;
  expiresAt: Date | null;
  urgency: ConsentUrgency;
  isLoading: boolean;
}

const getUrgency = (days: number | null): ConsentUrgency => {
  if (days === null) return 'safe';
  if (days <= 0) return 'expired';
  if (days <= 14) return 'critical';
  if (days <= 30) return 'warning';
  return 'safe';
};

/**
 * Returns the PSD2 consent status for the current user's Plaid connection.
 * PSD2 mandates a maximum 180-day consent window for bank data access.
 */
export const useBankingConsent = () => {
  const [status, setStatus] = useState<BankingConsentStatus>({
    isLinked: false,
    daysRemaining: null,
    expiresAt: null,
    urgency: 'safe',
    isLoading: true,
  });

  const fetchConsentStatus = async () => {
    if (!supabase) {
      setStatus(s => ({ ...s, isLoading: false }));
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatus(s => ({ ...s, isLoading: false }));
      return;
    }

    const { data, error } = await supabase
      .from('banking_connections')
      .select('connected_at, expires_at, status')
      .eq('user_id', user.id)
      .eq('provider', 'plaid')
      .eq('status', 'CONNECTED')
      .order('connected_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      setStatus({ isLinked: false, daysRemaining: null, expiresAt: null, urgency: 'safe', isLoading: false });
      return;
    }

    // Use expires_at if stored, otherwise fallback to connected_at + 180 days
    const expiresAt = data.expires_at
      ? new Date(data.expires_at)
      : new Date(new Date(data.connected_at).getTime() + 180 * 24 * 60 * 60 * 1000);

    const now = new Date();
    const msRemaining = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.max(Math.floor(msRemaining / (1000 * 60 * 60 * 24)), 0);

    setStatus({
      isLinked: true,
      daysRemaining,
      expiresAt,
      urgency: getUrgency(daysRemaining),
      isLoading: false,
    });
  };

  useEffect(() => {
    fetchConsentStatus();
  }, []);

  return { ...status, refresh: fetchConsentStatus };
};
