import { NextResponse } from 'next/server';
import { supabase } from '@/app/api/db';

export async function POST(request: Request) {
  try {
    const { userId, username } = await request.json();
    console.log(userId, username)
    if (!userId || !username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: existingUser, error: checkError } = await supabase
      .from('UserProfiles')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    const { error: insertError } = await supabase
      .from('UserProfiles')
      .insert([
        {
          userId,
          username,
          streak: 0,
        }
      ]);

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in register route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}