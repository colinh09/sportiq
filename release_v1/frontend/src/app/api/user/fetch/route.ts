import { NextResponse } from 'next/server';
import { supabase } from '@/app/api/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Using the user_complete_profile view instead of UserProfiles table
    const { data: profile, error } = await supabase
      .from('user_complete_profile')
      .select(`
        userId,
        username,
        streak,
        streak_updated_at,
        module_creation_limit,
        modules_added,
        modules_completed,
        modules_created
      `)
      .eq('userId', userId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // You can add some computed properties here if needed
    const profile_data = {
      ...profile,
      can_create_more_modules: profile.modules_created < profile.module_creation_limit,
      completion_rate: profile.modules_added > 0 
        ? Math.round((profile.modules_completed / profile.modules_added) * 100) 
        : 0
    };

    return NextResponse.json(profile_data);

  } catch (error) {
    console.error('Error in fetch user route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}