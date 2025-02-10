"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, GraduationCap, Trophy } from 'lucide-react';
import { ModuleDetails } from '@/lib/api/types';
import { modulesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/hooks/use-toast';
import FlashcardCarousel from '@/components/Carousel/FlashcardCarousel';
import QuestionCarousel from '@/components/Carousel/QuestionCarousel';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';

type StudyMode = 'flashcards' | 'quiz';

const HAPPY_CHAMPYS = [
  '/champy/happychampy.png',
  '/champy/surprisedchampy.png',
  '/champy/thrilledchampy.png'
];

const WRONG_CHAMPYS = [
  '/champy/angrychampy.png',
  '/champy/anxiouschampy.png',
  '/champy/worriedchampy.png'
];

const DIFFICULTY_MAP = {
  0: { label: 'Beginner', color: 'bg-green-500' },
  1: { label: 'Intermediate', color: 'bg-yellow-500' },
  2: { label: 'Advanced', color: 'bg-red-500' }
};

const TOPIC_ICONS = {
  player: <GraduationCap className="h-4 w-4" />,
  team: <Trophy className="h-4 w-4" />,
  rule: <BookOpen className="h-4 w-4" />,
  tournament: <Trophy className="h-4 w-4" />,
  position: <GraduationCap className="h-4 w-4" />
} as const;

export default function ModuleStudyPage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params?.moduleId as string;
  const { toast } = useToast();
  const { user, refreshUserData } = useAuth();
  const [module, setModule] = useState<ModuleDetails | null>(null);
  const [studyMode, setStudyMode] = useState<StudyMode>('flashcards');
  const [loading, setLoading] = useState(true);
  const [currentChampy, setCurrentChampy] = useState(HAPPY_CHAMPYS[0]);

  const updateChampyForFlashcards = () => {
    const randomIndex = Math.floor(Math.random() * HAPPY_CHAMPYS.length);
    setCurrentChampy(HAPPY_CHAMPYS[randomIndex]);
  };

  const updateChampyForQuiz = (isCorrect: boolean) => {
    const champyArray = isCorrect ? HAPPY_CHAMPYS : WRONG_CHAMPYS;
    const randomIndex = Math.floor(Math.random() * champyArray.length);
    setCurrentChampy(champyArray[randomIndex]);
  };

  const handleModuleComplete = async (score: number) => {
    if (!user || !moduleId) return;

    try {
      await modulesApi.toggleModuleStatus({
        userId: user.id,
        moduleId: parseInt(moduleId),
        status: true
      });

      await refreshUserData();

      toast({
        title: "Congratulations! 🎉",
        description: `You completed the module with a score of ${score} out of ${module?.questions.length}!`,
      });
      
      setTimeout(() => {
        router.push('/modules');
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.error || "Failed to mark module as complete",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchModule = async () => {
      if (!user || !moduleId) return;
      
      try {
        const data = await modulesApi.getModule(parseInt(moduleId), user.id);
        setModule(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.error || "Failed to load module",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId, user, toast]);

  if (!user) return null;
  
  if (loading || !module) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-base">Loading module...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header - fixed height */}
      <header className="border-b bg-card/50 backdrop-blur-sm flex-none">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => router.push('/modules')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="text-lg font-semibold truncate">{module.title}</h1>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-none">
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    {TOPIC_ICONS[module.topic]}
                    {module.topic.charAt(0).toUpperCase() + module.topic.slice(1)}
                  </Badge>
                  <Badge className={`${DIFFICULTY_MAP[module.difficulty].color} text-xs text-white`}>
                    {DIFFICULTY_MAP[module.difficulty].label}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant={studyMode === 'flashcards' ? 'default' : 'outline'}
                  onClick={() => {
                    setStudyMode('flashcards');
                    updateChampyForFlashcards();
                  }}
                  className="flex items-center gap-1"
                >
                  <BookOpen className="h-4 w-4" />
                  Flashcards
                </Button>
                <Button
                  size="sm"
                  variant={studyMode === 'quiz' ? 'default' : 'outline'}
                  onClick={() => {
                    setStudyMode('quiz');
                    updateChampyForFlashcards();
                  }}
                  className="flex items-center gap-1"
                >
                  <GraduationCap className="h-4 w-4" />
                  Quiz
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area - flexible height */}
      <main className="flex-1 flex">
        <div className="max-w-7xl mx-auto w-full flex items-center px-4 py-4">
          {/* Content grid */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-center max-h-[calc(100vh-10rem)]">
            {/* Champy Container */}
            <div className="hidden lg:block lg:col-span-4">
              <div className="relative w-full max-h-64 aspect-[4/3] mx-auto">
                <Image
                  src={currentChampy}
                  alt="Champy mascot"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            {/* Study Content */}
            <div className="lg:col-span-8 max-h-full">
              <div className="h-full max-h-[calc(100vh-12rem)]">
                {studyMode === 'flashcards' ? (
                  <FlashcardCarousel
                    flashcards={module.flashcards}
                    onComplete={() => setStudyMode('quiz')}
                    onIndexChange={() => updateChampyForFlashcards()}
                  />
                ) : (
                  <QuestionCarousel
                    questions={module.questions}
                    onAnswerSubmit={(isCorrect) => updateChampyForQuiz(isCorrect)}
                    onComplete={handleModuleComplete}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}