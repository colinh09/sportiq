'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}