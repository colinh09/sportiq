'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  username: string | null;
  streak: number;
  streakUpdatedAt: Date | null;
  updateStreak: (newStreak: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [streakUpdatedAt, setStreakUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);

      if (session?.user) {
        const { data: userData, error } = await supabase
          .from('UserProfiles')
          .select('username, streak, streak_updated_at')
          .eq('userId', session.user.id)
          .single();

        if (!error && userData) {
          setUsername(userData.username);
          setStreak(userData.streak || 0);
          setStreakUpdatedAt(userData.streak_updated_at ? new Date(userData.streak_updated_at) : null);
        }
      }
      setLoading(false);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);

        if (session?.user) {
          const { data: userData, error } = await supabase
            .from('UserProfiles')
            .select('username, streak, streak_updated_at')
            .eq('userId', session.user.id)
            .single();

          if (!error && userData) {
            setUsername(userData.username);
            setStreak(userData.streak || 0);
            setStreakUpdatedAt(userData.streak_updated_at ? new Date(userData.streak_updated_at) : null);
          }
        } else {
          setUsername(null);
          setStreak(0);
          setStreakUpdatedAt(null);
        }
      });

      return () => subscription.unsubscribe();
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    // First do the auth signup
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (signUpError) {
      throw signUpError;
    }

    if (user) {
      // Then create the user profile through our API
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          username: username,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user profile');
      }
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setIsAuthenticated(false);
      setUsername(null);
      setStreak(0);
      setStreakUpdatedAt(null);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }
  };

  const updateStreak = async (newStreak: number) => {
    if (!user) return;

    const response = await fetch('/api/user/update-streak', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        streak: newStreak,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update streak');
    }

    setStreak(newStreak);
    setStreakUpdatedAt(new Date());
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated,
    username,
    streak,
    streakUpdatedAt,
    updateStreak,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};