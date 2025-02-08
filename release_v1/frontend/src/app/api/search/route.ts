import { NextResponse } from 'next/server'
import { supabase } from '@/app/api/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const keywords = searchParams.get('keywords')

    if (!keywords) {
      return NextResponse.json(
        { error: 'Missing keywords parameter' },
        { status: 400 }
      )
    }

    // Search in Players
    const { data: players, error: playersError } = await supabase
      .from('Players')
      .select(`
        playerId,
        name,
        teamId,
        PlayerPositions (
          position
        )
      `)
      .ilike('name', `%${keywords}%`)
      .limit(5)

    if (playersError) throw playersError

    // Search in Teams
    const { data: teams, error: teamsError } = await supabase
      .from('Teams')
      .select('teamId, displayName')
      .ilike('displayName', `%${keywords}%`)
      .limit(5)

    if (teamsError) throw teamsError

    // Format results
    const results = [
      ...(players?.map(p => ({
        value: p.name,
        type: 'player',
        id: p.playerId,
        teamId: p.teamId,
        keywords: [
          p.name.toLowerCase(),
          ...(p.PlayerPositions || []).map(pp => pp.position.toLowerCase())
        ]
      })) ?? []),
      ...(teams?.map(t => ({
        value: t.displayName,
        type: 'team',
        id: t.teamId,
        keywords: [t.displayName.toLowerCase()]
      })) ?? [])
    ]

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
}
