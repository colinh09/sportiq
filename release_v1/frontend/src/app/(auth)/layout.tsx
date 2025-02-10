'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'

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
    <div className="min-h-screen bg-gray-50 text-sm md:text-base lg:text-lg">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Image
              src="/SportIQ_Logo.png"
              alt="SportIQ Logo"
              width={200}
              height={80}
              priority
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}