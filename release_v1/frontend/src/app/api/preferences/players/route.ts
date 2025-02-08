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
      .from('UserPlayers')
      .select('*')
      .eq('userId', userId)

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching player preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player preferences' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId, playerId } = await request.json()
    if (!userId || !playerId) {
      return NextResponse.json(
        { error: 'User ID and Player ID are required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('UserPlayers')
      .insert([{ userId, playerId }])

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Player already in preferences' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding player preference:', error)
    return NextResponse.json(
      { error: 'Failed to add player preference' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, playerId } = await request.json()
    if (!userId || !playerId) {
      return NextResponse.json(
        { error: 'User ID and Player ID are required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('UserPlayers')
      .delete()
      .eq('userId', userId)
      .eq('playerId', playerId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing player preference:', error)
    return NextResponse.json(
      { error: 'Failed to remove player preference' },
      { status: 500 }
    )
  }
}
