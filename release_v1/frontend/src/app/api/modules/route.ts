import { NextRequest, NextResponse } from 'next/server';
import { createModule } from './createModule';
import { supabase } from '@/app/api/db';

interface CreateModuleRequest {
  title: string;
  topic: 'player' | 'team' | 'rule' | 'tournament' | 'position';
  concept: string;
  difficulty: 0 | 1 | 2;
  userId: string;
}

interface GetModuleRequest {
  moduleId: number;
  userId?: string;
}

interface ModuleData {
  moduleId: number;
  title: string;
  topic: string;
  concept: string;
  difficulty: number;
  created_at: string;
  userId: string;
  creator: Array<{ username: string }>;
}

interface ModuleResponse {
  moduleId: number;
  title: string;
  topic: string;
  concept: string;
  difficulty: number;
  created_at: string;
  creator_username: string;
  status?: boolean;
  flashcards: Array<{
    flashcardId: number;
    term: string;
    definition: string;
    order_index: number;
  }>;
  questions: Array<{
    questionId: number;
    content: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    correct_option_index: number;
    order_index: number;
  }>;
}

interface SearchResult {
  value: string;
  type: 'team' | 'player' | 'module';
  id: string | number;
  teamId?: string | number;
  keywords: string[];
  creator?: string;
  isUser?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateModuleRequest = await request.json();
    const { title, topic, concept, difficulty, userId } = body;

    if (!userId || !title || !topic || !concept || difficulty === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const moduleContent = await createModule({
      topic,
      concept,
      difficulty,
      sport: 'baseball'
    });

    if (moduleContent instanceof Error) {
      return NextResponse.json(
        { error: moduleContent.message },
        { status: 500 }
      );
    }

    const { data: moduleData, error: moduleError } = await supabase
      .from('CustomModules')
      .insert({
        title,
        topic,
        concept,
        difficulty,
        sport: 'baseball',
        num_questions: 5,
        userId
      })
      .select()
      .single();

    if (moduleError) {
      return NextResponse.json(
        { error: 'Failed to create module' },
        { status: 500 }
      );
    }

    const moduleId = moduleData.moduleId;

    const { error: flashcardsError } = await supabase
      .from('Flashcards')
      .insert(
        moduleContent.flashcards.map((flashcard, index) => ({
          moduleId,
          term: flashcard.term,
          definition: flashcard.definition,
          order_index: index
        }))
      );

    if (flashcardsError) {
      return NextResponse.json(
        { error: 'Failed to create flashcards' },
        { status: 500 }
      );
    }

    const { error: questionsError } = await supabase
      .from('Questions')
      .insert(
        moduleContent.questions.map((question, index) => ({
          moduleId,
          content: question.content,
          option1: question.option1,
          option2: question.option2,
          option3: question.option3,
          option4: question.option4,
          correct_option_index: question.correct_option_index,
          order_index: index
        }))
      );

    if (questionsError) {
      return NextResponse.json(
        { error: 'Failed to create questions' },
        { status: 500 }
      );
    }

    const { error: userModuleError } = await supabase
      .from('UserModules')
      .insert({
        userId,
        moduleId,
        status: false
      });

    if (userModuleError) {
      return NextResponse.json(
        { error: 'Failed to create user module entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      moduleId
    });

  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');
    const userId = searchParams.get('userId');

    if (!moduleId) {
      console.error('Missing moduleId in request params');
      return NextResponse.json(
        { error: 'Module ID is required' },
        { status: 400 }
      );
    }

    const { data: moduleData, error: moduleError }: { data: ModuleData | null; error: any } = await supabase
      .from('CustomModules')
      .select(`
        moduleId,
        title,
        topic,
        concept,
        difficulty,
        created_at,
        userId,
        creator:UserProfiles!CustomModules_userId_fkey1(username)
      `)
      .eq('moduleId', parseInt(moduleId))
      .single();

    if (moduleError) {
      console.error('Error fetching module data:', moduleError);
      return NextResponse.json(
        { error: 'Failed to fetch module data', details: moduleError.message },
        { status: 500 }
      );
    }

    if (!moduleData) {
      console.error('No module found for ID:', moduleId);
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    const { data: flashcards, error: flashcardsError } = await supabase
      .from('Flashcards')
      .select('*')
      .eq('moduleId', parseInt(moduleId))
      .order('order_index');

    if (flashcardsError) {
      console.error('Error fetching flashcards:', flashcardsError);
      return NextResponse.json(
        { error: 'Failed to fetch flashcards', details: flashcardsError.message },
        { status: 500 }
      );
    }

    const { data: questions, error: questionsError } = await supabase
      .from('Questions')
      .select('*')
      .eq('moduleId', parseInt(moduleId))
      .order('order_index');

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return NextResponse.json(
        { error: 'Failed to fetch questions', details: questionsError.message },
        { status: 500 }
      );
    }

    let status = undefined;
    if (userId) {
      const { data: userModule, error: userModuleError } = await supabase
        .from('UserModules')
        .select('status')
        .eq('moduleId', parseInt(moduleId))
        .eq('userId', userId)
        .single();
      
      if (userModuleError) {
        console.error('Error fetching user module status:', userModuleError);
      }
      
      if (userModule) {
        status = userModule.status;
      }
    }

    const response: ModuleResponse = {
      moduleId: moduleData.moduleId,
      title: moduleData.title,
      topic: moduleData.topic,
      concept: moduleData.concept,
      difficulty: moduleData.difficulty,
      created_at: moduleData.created_at,
      creator_username: moduleData.creator[0]?.username,
      status,
      flashcards,
      questions
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Unexpected error in GET /module:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}