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
      .from('UserTeams')
      .select('*')
      .eq('userId', userId)

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching team preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team preferences' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId, teamId } = await request.json()
    if (!userId || !teamId) {
      return NextResponse.json(
        { error: 'User ID and Team ID are required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('UserTeams')
      .insert([{ userId, teamId }])

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Team already in preferences' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding team preference:', error)
    return NextResponse.json(
      { error: 'Failed to add team preference' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, teamId } = await request.json()
    if (!userId || !teamId) {
      return NextResponse.json(
        { error: 'User ID and Team ID are required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('UserTeams')
      .delete()
      .eq('userId', userId)
      .eq('teamId', teamId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing team preference:', error)
    return NextResponse.json(
      { error: 'Failed to remove team preference' },
      { status: 500 }
    )
  }
}
