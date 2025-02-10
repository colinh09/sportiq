import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/api/db';

interface ToggleModuleStatusRequest {
  userId: string;
  moduleId: number;
  status: boolean;
}

export async function PATCH(request: NextRequest) {
  try {
    const body: ToggleModuleStatusRequest = await request.json();
    const { userId, moduleId, status } = body;

    if (!userId || moduleId === undefined || status === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First, check if the user-module relationship exists
    const { data: existingRecord, error: checkError } = await supabase
      .from('UserModules')
      .select('*')
      .eq('userId', userId)
      .eq('moduleId', moduleId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking user module:', checkError);
      return NextResponse.json(
        { error: 'Failed to check user module status' },
        { status: 500 }
      );
    }

    let result;
    if (!existingRecord) {
      // If no record exists, create one
      result = await supabase
        .from('UserModules')
        .insert({
          userId,
          moduleId,
          status
        })
        .select()
        .single();
    } else {
      // If record exists, update it
      result = await supabase
        .from('UserModules')
        .update({ status })
        .eq('userId', userId)
        .eq('moduleId', moduleId)
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error updating module status:', result.error);
      return NextResponse.json(
        { error: 'Failed to update module status' },
        { status: 500 }
      );
    }

    // If the module was marked as complete, handle streak update
    if (status) {
      // First get the user's current streak info
      const { data: userData, error: userError } = await supabase
        .from('UserProfiles')
        .select('streak, streak_updated_at')
        .eq('userId', userId)
        .single();

      if (userError) {
        console.error('Error fetching user streak data:', userError);
      } else if (userData) {
        const lastUpdated = new Date(userData.streak_updated_at);
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        // Only update streak if last update was yesterday
        if (lastUpdated.toDateString() === yesterday.toDateString()) {
          const { error: streakError } = await supabase
            .from('UserProfiles')
            .update({ 
              streak: userData.streak + 1,
              streak_updated_at: now.toISOString()
            })
            .eq('userId', userId);

          if (streakError) {
            console.error('Error updating user streak:', streakError);
          }
        } else if (lastUpdated.toDateString() !== now.toDateString()) {
          // If last update wasn't today, set streak to 1
          const { error: streakError } = await supabase
            .from('UserProfiles')
            .update({ 
              streak: 1,
              streak_updated_at: now.toISOString()
            })
            .eq('userId', userId);

          if (streakError) {
            console.error('Error resetting user streak:', streakError);
          }
        }
        // If lastUpdated is today, don't update streak at all
      }
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error toggling module status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}