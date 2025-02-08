import { NextResponse } from 'next/server'
import { supabase } from '@/app/api/db'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('Teams')
      .select('*')
    console.log
    if (error) {
      console.error('Supabase Query Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch teams', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams', details: error instanceof Error ? error.message : error },
      { status: 500 }
    )
  }
}