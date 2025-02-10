import { NextResponse } from 'next/server';
import { supabase } from '@/app/api/db';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const moduleId = searchParams.get('moduleId');

    if (!userId || !moduleId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('UserModules')
      .delete()
      .eq('userId', userId)
      .eq('moduleId', moduleId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete user module' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in delete user module route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}