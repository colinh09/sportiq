'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { usersApi } from '@/lib/api/users'
import { UserProfile } from '@/lib/api/types'

const supabase = createClientComponentClient()

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
  moduleCreationLimit: number;
  modulesAdded: number;
  modulesCompleted: number;
  modulesCreated: number;
  canCreateMoreModules: boolean;
  completionRate: number;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [streak, setStreak] = useState<number>(0)
  const [streakUpdatedAt, setStreakUpdatedAt] = useState<Date | null>(null)
  const [moduleCreationLimit, setModuleCreationLimit] = useState<number>(1)
  const [modulesAdded, setModulesAdded] = useState<number>(0)
  const [modulesCompleted, setModulesCompleted] = useState<number>(0)
  const [modulesCreated, setModulesCreated] = useState<number>(0)
  const [canCreateMoreModules, setCanCreateMoreModules] = useState<boolean>(true)
  const [completionRate, setCompletionRate] = useState<number>(0)

  const fetchUserData = async (userId: string) => {
    try {
      const userData = await usersApi.fetchUserProfile(userId)
      setUsername(userData.username)
      setStreak(userData.streak || 0)
      setStreakUpdatedAt(userData.streak_updated_at ? new Date(userData.streak_updated_at) : null)
      setModuleCreationLimit(userData.module_creation_limit)
      setModulesAdded(userData.modules_added)
      setModulesCompleted(userData.modules_completed)
      setModulesCreated(userData.modules_created)
      setCanCreateMoreModules(userData.can_create_more_modules)
      setCompletionRate(userData.completion_rate)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const refreshUserData = async () => {
    if (!user) return
    await fetchUserData(user.id)
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted) {
          setUser(session?.user ?? null)
          setIsAuthenticated(!!session?.user)

          if (session?.user) {
            await fetchUserData(session.user.id)
          }
          setLoading(false)
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (mounted) {
            setUser(session?.user ?? null)
            setIsAuthenticated(!!session?.user)

            if (session?.user) {
              await fetchUserData(session.user.id)
            } else {
              setUsername(null)
              setStreak(0)
              setStreakUpdatedAt(null)
              setModuleCreationLimit(1)
              setModulesAdded(0)
              setModulesCompleted(0)
              setModulesCreated(0)
              setCanCreateMoreModules(true)
              setCompletionRate(0)
            }
          }
        })

        return () => {
          mounted = false
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Error in auth initialization:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })
  
      if (signUpError) {
        throw signUpError
      }
  
      if (!user) {
        throw new Error('No user returned from signUp')
      }

      try {
        await usersApi.register(user.id, username)
      } catch (error) {
        await supabase.auth.admin.deleteUser(user.id)
        throw new Error('Failed to create user profile')
      }
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      // Clear local storage tokens
      for (let key of Object.keys(localStorage)) {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key)
        }
      }

      // Clear cookies
      const cookies = document.cookie.split(';')
      for (let cookie of cookies) {
        const name = cookie.split('=')[0].trim()
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`
      }

      // Clear state
      setUser(null)
      setIsAuthenticated(false)
      setUsername(null)
      setStreak(0)
      setStreakUpdatedAt(null)
      setModuleCreationLimit(1)
      setModulesAdded(0)
      setModulesCompleted(0)
      setModulesCreated(0)
      setCanCreateMoreModules(true)
      setCompletionRate(0)

      // Sign out of Supabase
      await supabase.auth.signOut({ scope: 'local' })

      // Force a complete page reload after clearing everything
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if there's an error, try to force logout
      window.location.href = '/login'
    }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (error) {
      throw error
    }
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      throw error
    }
  }

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
    moduleCreationLimit,
    modulesAdded,
    modulesCompleted,
    modulesCreated,
    canCreateMoreModules,
    completionRate,
    refreshUserData,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}