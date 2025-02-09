import { NextResponse } from 'next/server'
import { supabase } from '@/app/api/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('UserModules')
      .select(`
        userId,
        moduleId,
        status,
        CustomModules (
          title,
          topic,
          concept,
          difficulty,
          created_at
        )
      `)
      .eq('userId', userId)

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching user modules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user modules' },
      { status: 500 }
    )
  }
}