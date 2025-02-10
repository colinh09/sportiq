import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const prodUrl = process.env.NEXT_PUBLIC_PROD_URL
const devUrl = process.env.NEXT_PUBLIC_DEV_URL
const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'True'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Basic security headers
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  const host = req.headers.get('host')
  
  // In production mode, only allow the production domain
  if (!isDev && !host?.includes('sportiqapp.com')) {
    return NextResponse.json(
      { error: 'Access denied: Only production domain allowed' },
      { status: 403 }
    )
  }

  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session && req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return res
}

export const config = {
  matcher: '/api/:path*'
}