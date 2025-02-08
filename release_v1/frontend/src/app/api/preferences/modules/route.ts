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
      .select('*')
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

export async function POST(request: Request) {
  try {
    const { userId, moduleId } = await request.json()
    if (!userId || !moduleId) {
      return NextResponse.json(
        { error: 'User ID and Module ID are required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('UserModules')
      .insert([{ userId, moduleId, status: false }])

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Module already in user list' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding module to user list:', error)
    return NextResponse.json(
      { error: 'Failed to add module to user list' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, moduleId } = await request.json()
    if (!userId || !moduleId) {
      return NextResponse.json(
        { error: 'User ID and Module ID are required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('UserModules')
      .delete()
      .eq('userId', userId)
      .eq('moduleId', moduleId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing module from user list:', error)
    return NextResponse.json(
      { error: 'Failed to remove module from user list' },
      { status: 500 }
    )
  }
}
