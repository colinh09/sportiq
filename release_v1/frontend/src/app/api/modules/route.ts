import { NextResponse } from 'next/server'
import { supabase } from '@/app/api/db'

// Define interfaces for search results
interface SearchResult {
  value: string;
  type: 'team' | 'player' | 'module';
  id: string | number;
  teamId?: string | number;
  keywords: string[];
  creator?: string;
  isUser?: boolean;
}

interface CustomModule {
  moduleId: string;
  title: string;
  topic: string;
  concept: string;
  difficulty: string;
  userId: string;
}

interface UserProfile {
  userId: string;
  username: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const keywords = searchParams.get('keywords')
    const type = searchParams.get('type') || 'players'

    if (!keywords) {
      return NextResponse.json(
        { error: 'Missing keywords parameter' },
        { status: 400 }
      )
    }

    let results: SearchResult[] = []

    switch (type) {
      case 'players': {
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

        if (playersError) {
          console.error('Players search error:', playersError)
          throw playersError
        }

        results = (players || []).map(p => ({
          value: p.name,
          type: 'player' as const,
          id: p.playerId,
          teamId: p.teamId,
          keywords: [
            p.name.toLowerCase(),
            ...(p.PlayerPositions || []).map(pp => pp.position.toLowerCase())
          ]
        }))
        break
      }

      case 'teams': {
        const { data: teams, error: teamsError } = await supabase
          .from('Teams')
          .select('teamId, displayName')
          .ilike('displayName', `%${keywords}%`)
          .limit(5)

        if (teamsError) {
          console.error('Teams search error:', teamsError)
          throw teamsError
        }

        results = (teams || []).map(t => ({
          value: t.displayName,
          type: 'team' as const,
          id: t.teamId,
          keywords: [t.displayName.toLowerCase()]
        }))
        break
      }

      case 'modules': {
        // First, search modules by title or concept
        const { data: modules, error: modulesError } = await supabase
          .from('CustomModules')
          .select(`
            moduleId,
            title,
            topic,
            concept,
            difficulty,
            userId
          `)
          .or(`title.ilike.%${keywords}%,concept.ilike.%${keywords}%`)
          .limit(5)

        if (modulesError) {
          console.error('Modules search error:', modulesError)
          throw modulesError
        }

        // Get usernames for module creators
        const creatorIds = modules.map(m => m.userId);
        const { data: userProfiles, error: profilesError } = await supabase
          .from('UserProfiles')
          .select('userId, username')
          .in('userId', creatorIds)

        if (profilesError) {
          console.error('Profiles search error:', profilesError)
          throw profilesError
        }

        // Create a map of userId to username
        const usernameMap = new Map(userProfiles.map(profile => [profile.userId, profile.username]));

        // Search users who have created modules
        const { data: users, error: usersError } = await supabase
          .from('UserProfiles')
          .select(`
            userId,
            username,
            CustomModules (
              moduleId,
              title
            )
          `)
          .ilike('username', `%${keywords}%`)
          .limit(5)

        if (usersError) {
          console.error('Users search error:', usersError)
          throw usersError
        }

        results = [
          // Module results from title/concept search
          ...(modules || []).map(m => ({
            value: m.title,
            type: 'module' as const,
            id: m.moduleId,
            creator: usernameMap.get(m.userId) || 'Unknown',
            keywords: [
              m.title.toLowerCase(),
              m.topic.toLowerCase(),
              `difficulty:${m.difficulty}`
            ]
          })),
          // User results with their module count
          ...(users || []).map(u => ({
            value: `${u.username} (${u.CustomModules?.length || 0} modules)`,
            type: 'module' as const,
            id: u.userId,
            isUser: true,
            keywords: [u.username.toLowerCase()]
          }))
        ]
        break
      }

      default:
        return NextResponse.json(
          { error: 'Invalid search type' },
          { status: 400 }
        )
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Comprehensive search error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to perform search', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}