import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/api/db';

// Define interfaces for your data structures
interface CustomModule {
  moduleId: string;
  title: string;
  topic: string;
  concept: string;
  difficulty: string;
  created_at: string;
  userId: string;
}

interface UserModule {
  moduleId: string;
  status: string;
  CustomModules: CustomModule;
}

interface UserProfile {
  userId: string;
  username: string;
}

interface FormattedModule {
  moduleId: string;
  title: string;
  topic: string;
  concept: string;
  difficulty: string;
  created_at: string;
  creator_username: string;
  status: string;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const sortBy = url.searchParams.get('sort_by') || 'created_at';
    const sortOrder = url.searchParams.get('sort_order') || 'desc';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get total count first
    const { count, error: countError } = await supabase
      .from('UserModules')
      .select('*', { count: 'exact', head: true })
      .eq('userId', userId);

    if (countError) {
      console.error('Error fetching count:', countError);
      return NextResponse.json(
        { error: 'Failed to fetch modules count' },
        { status: 500 }
      );
    }

    const totalCount = count || 0;
    const offset = (page - 1) * limit;

    // First get the modules data
    let query = supabase
      .from('UserModules')
      .select(`
        moduleId,
        status,
        CustomModules!inner (
          moduleId,
          title,
          topic,
          concept,
          difficulty,
          created_at,
          userId
        )
      `)
      .eq('userId', userId)
      .range(offset, offset + limit - 1);

    // Apply sorting
    if (sortBy === 'status') {
      query = query.order('status', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'created_at') {
      query = query.order('CustomModules(created_at)', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'difficulty') {
      query = query.order('CustomModules(difficulty)', { ascending: sortOrder === 'asc' });
    }

    const { data: modulesData, error: modulesError } = await query as { 
      data: UserModule[] | null;
      error: any;
    };

    if (modulesError) {
      console.error('Error fetching modules:', modulesError);
      return NextResponse.json(
        { error: 'Failed to fetch modules', details: modulesError.message },
        { status: 500 }
      );
    }

    if (!modulesData || modulesData.length === 0) {
      return NextResponse.json({
        modules: [],
        metadata: {
          total_count: 0,
          current_page: page,
          total_pages: 0,
          has_more: false
        }
      });
    }

    // Get usernames in a separate query
    const creatorIds = modulesData.map(module => module.CustomModules.userId);
    const { data: userProfiles, error: profilesError } = await supabase
      .from('UserProfiles')
      .select('userId, username')
      .in('userId', creatorIds) as {
        data: UserProfile[] | null;
        error: any;
      };

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch user profiles', details: profilesError.message },
        { status: 500 }
      );
    }

    // Create a map of userId to username for easy lookup
    const usernameMap = new Map(userProfiles?.map(profile => [profile.userId, profile.username]));

    // Format response
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    const formattedModules: FormattedModule[] = modulesData.map(module => ({
      moduleId: module.CustomModules.moduleId,
      title: module.CustomModules.title,
      topic: module.CustomModules.topic,
      concept: module.CustomModules.concept,
      difficulty: module.CustomModules.difficulty,
      created_at: module.CustomModules.created_at,
      creator_username: usernameMap.get(module.CustomModules.userId) || 'Unknown User',
      status: module.status
    }));

    const response = {
      modules: formattedModules,
      metadata: {
        total_count: totalCount,
        current_page: page,
        total_pages: totalPages,
        has_more: hasMore
      }
    };
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error in GET request:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}