'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Navbar } from '@/components/Layout/Navbar/Navbar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="">
      <Navbar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}