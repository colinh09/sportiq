import { NextResponse } from 'next/server'
import { supabase } from '@/app/api/db'

interface PlayerDetails {
  name: string
  headshotUrl: string
}

interface TeamLeader {
  playerId: number
  Players: PlayerDetails
}

export async function GET(
  request: Request,
  context: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await context.params
    
    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      )
    }

    const [
      teamResponse,
      playersResponse,
      leadersResponse,
      gamesResponse,
      upcomingResponse,
      recordResponse
    ] = await Promise.all([
      // Basic team info (now includes standing)
      supabase
        .from('Teams')
        .select('*')
        .eq('teamId', teamId)
        .single(),

      // Team players with positions using a proper join
      supabase
        .from('Players')
        .select(`
          *,
          PlayerPositions (
            position,
            position_code
          )
        `)
        .eq('teamId', teamId),

      // Team leaders
      supabase
        .from('TeamLeaders')
        .select(`
          playerId,
          Players (
            name,
            headshotUrl
          )
        `)
        .eq('teamId', teamId)
        .limit(5),

      // Past games
      supabase
        .from('Games')
        .select('*')
        .eq('teamId', teamId)
        .order('date', { ascending: false }),

      // Upcoming games
      supabase
        .from('UpcomingGames')
        .select('*')
        .eq('teamId', teamId)
        .order('date', { ascending: true }),

      // Team record
      supabase
        .from('Records')
        .select('*')
        .eq('teamId', teamId)
        .single()
    ])

    // Check for any errors
    if (teamResponse.error) throw teamResponse.error
    if (playersResponse.error) throw playersResponse.error
    if (leadersResponse.error) throw leadersResponse.error
    if (gamesResponse.error) throw gamesResponse.error
    if (upcomingResponse.error) throw upcomingResponse.error
    if (recordResponse.error) throw recordResponse.error

    // Transform players to include position information
    const players = playersResponse.data?.map(player => ({
      ...player,
      position: player.PlayerPositions[0]?.position || null,
      position_code: player.PlayerPositions[0]?.position_code || null
    })) || []

    const leaders = (leadersResponse.data as unknown as TeamLeader[]).map(leader => {
      // Find this leader in the players array to get their position
      const playerData = players.find(p => p.playerId === leader.playerId)
      return [
        leader.Players.name,
        playerData?.position || "Unknown",  // Use actual position instead of "Leader"
        leader.Players.headshotUrl
      ]
    })

    return NextResponse.json({
      teamInfo: teamResponse.data,
      players,
      leaders,
      standing: teamResponse.data.standing,
      games: gamesResponse.data,
      upcomingGames: upcomingResponse.data,
      record: recordResponse.data
    })
  } catch (error) {
    console.error('Error fetching team data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team data' },
      { status: 500 }
    )
  }
}