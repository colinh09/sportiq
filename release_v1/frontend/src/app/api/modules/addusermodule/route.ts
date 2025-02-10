import { NextResponse } from 'next/server';
import { supabase } from '@/app/api/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = body.userId;
    const moduleId = body.moduleId;

    if (!userId || !moduleId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Check if the entry already exists
    const { data: existing } = await supabase
      .from('UserModules')
      .select('*')
      .eq('userId', userId)
      .eq('moduleId', moduleId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'User module already exists' },
        { status: 400 }
      );
    }

    // Add new user module entry
    const { error } = await supabase
      .from('UserModules')
      .insert([
        {
          userId: userId,
          moduleId: moduleId,
          status: false
        }
      ]);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to add user module' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in add user module route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}