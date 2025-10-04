import { createClient, Session } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { apiGet } from '../services/api';
import { DEFAULT_PLATFORM_SETTINGS, PlatformSettings } from '../services/settings';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

type UserRole = 'agent' | 'landlord' | 'seeker' | 'admin' | 'agency';
type SubscriptionStatus = 'trial' | 'active' | 'expired';

type User = {
  id: number;
  supabase_user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  subscription_status: SubscriptionStatus;
  approval_status: string | null;
  trial_end_date: string | null;
  last_sign_in_at?: string | null;
  metadata?: Record<string, unknown> | null;
};

type SignUpPayload = {
  full_name: string;
  phone: string;
  role: UserRole | 'landlord_agent';
};

type AuthContextType = {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  platformSettings: PlatformSettings;
  signIn: (email: string, password: string) => Promise<User | null>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, userData: SignUpPayload) => Promise<User | null>;
  signOut: () => Promise<void>;
  updateProfile: (data: Record<string, unknown>) => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);

  const normalizeRole = useCallback((role?: string | null): UserRole => {
    if (!role) return 'seeker';
    const lowered = role.toLowerCase();
    if (lowered === 'landlord_agent' || lowered === 'landlord-agent') return 'agent';
    if (lowered === 'landlord') return 'landlord';
    if (lowered === 'agent') return 'agent';
    if (lowered === 'admin') return 'admin';
    if (lowered === 'agency') return 'agency';
    return 'seeker';
  }, []);

  const syncProfile = useCallback(
    async ({ session, method = 'POST', body }: { session?: Session | null; method?: 'POST' | 'PUT'; body?: Record<string, unknown> } = {}): Promise<User | null> => {
      if (!supabase) throw new Error('Authentication provider not configured');
      const activeSession = session ?? (await supabase.auth.getSession()).data.session;
      const accessToken = activeSession?.access_token;
      if (!accessToken) {
        setUser(null);
        setUserRole(null);
        return null;
      }

      const payload = {
        trial_days: platformSettings.trial_days,
        ...body,
      };

      const response = await fetch('/.netlify/functions/auth-profile', {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let profile: User | null = null;
      if (text) {
        try {
          profile = JSON.parse(text);
        } catch {
          throw new Error(text);
        }
      }

      if (!response.ok) {
        throw new Error(profile ? 'Failed to sync profile' : text || 'Failed to sync profile');
      }

      if (profile) {
        const normalisedRole = normalizeRole(profile.role);
        const resolved: User = {
          ...profile,
          role: normalisedRole,
          subscription_status: normalizeSubscription(profile.subscription_status),
        };
        setUser(resolved);
        setUserRole(resolved.role);
        return resolved;
      }

      return null;
    },
    [normalizeRole, platformSettings.trial_days]
  );

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: { unsubscribe: () => void } | null = null;

    (async () => {
      let settings = DEFAULT_PLATFORM_SETTINGS;
      try {
        const remote = await apiGet<PlatformSettings>('settings');
        settings = { ...DEFAULT_PLATFORM_SETTINGS, ...remote };
      } catch {
        // keep defaults on failure
      }
      if (cancelled) return;
      setPlatformSettings(settings);

      if (!supabase) {
        setLoading(false);
        return;
      }

      const handleSession = async (session: Session | null) => {
        if (cancelled) return;
        try {
          await syncProfile({ session, method: 'POST' });
        } catch (error) {
          console.error('Failed to sync profile', error);
          if (!session) {
            setUser(null);
            setUserRole(null);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      const { data: sessionData } = await supabase.auth.getSession();
      await handleSession(sessionData.session);

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        handleSession(session);
      });
      unsubscribe = data?.subscription ?? null;
    })();

    return () => {
      cancelled = true;
      unsubscribe?.unsubscribe();
    };
  }, [syncProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Authentication provider not configured');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const profile = await syncProfile({ session: data.session, method: 'POST' });
    return profile;
  }, [syncProfile]);

  const signUp = useCallback(async (email: string, password: string, userData: SignUpPayload) => {
    if (!supabase) throw new Error('Authentication provider not configured');
    const role = normalizeRole(userData.role);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          phone: userData.phone,
          role,
        },
      },
    });
    if (error) throw error;

    if (data.session) {
      return await syncProfile({
        session: data.session,
        method: 'POST',
        body: {
          full_name: userData.full_name,
          phone: userData.phone,
          role,
        },
      });
    }

    return null;
  }, [normalizeRole, syncProfile]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) throw new Error('Authentication provider not configured');
    const redirectTo = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
  }, []);

  const updateProfile = useCallback(async (data: Record<string, unknown>) => {
    if (!supabase) {
      setUser(prev => (prev ? { ...prev, ...(data as Partial<User>) } : prev));
      return user;
    }
    const updated = await syncProfile({ method: 'PUT', body: data });
    return updated;
  }, [syncProfile, user]);

  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    userRole,
    loading,
    platformSettings,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    updateProfile,
  }), [loading, platformSettings, signIn, signInWithGoogle, signOut, signUp, updateProfile, user, userRole]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function normalizeSubscription(status?: string | null): SubscriptionStatus {
  switch (status) {
    case 'active':
      return 'active';
    case 'expired':
      return 'expired';
    case 'trial':
    default:
      return 'trial';
  }
}
