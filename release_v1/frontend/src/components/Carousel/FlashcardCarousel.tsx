import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BaseCarousel from './BaseCarousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Flashcard } from '@/lib/api/types';

interface FlashcardCarouselProps {
  flashcards: Flashcard[];
  onComplete?: () => void;
  onIndexChange?: (index: number) => void;
  className?: string;
}

const FlashcardCarousel: React.FC<FlashcardCarouselProps> = ({
  flashcards,
  onComplete,
  onIndexChange,
  className = ''
}) => {
  const [flippedStates, setFlippedStates] = useState<boolean[]>(
    new Array(flashcards.length).fill(false)
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const toggleFlip = () => {
    const newStates = [...flippedStates];
    newStates[currentIndex] = !newStates[currentIndex];
    setFlippedStates(newStates);
  };

  const handleIndexChange = (newIndex: number) => {
    setCurrentIndex(newIndex);
    const newStates = [...flippedStates];
    newStates[currentIndex] = false;
    setFlippedStates(newStates);
    
    if (onIndexChange) {
      onIndexChange(newIndex);
    }
  };

  const renderFlashcard = (flashcard: Flashcard, index: number) => (
    <div className="w-full h-full flex items-center justify-center">
      {/* Flashcard Container */}
      <div className="w-full h-full">
        <div 
          className="perspective-1000 w-full h-full cursor-pointer" 
          onClick={toggleFlip}
        >
          <motion.div
            className="relative w-full h-full"
            initial={false}
            animate={{ rotateY: flippedStates[index] ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Front of card */}
            <Card 
              className={`
                absolute inset-0 w-full h-full 
                transition-transform duration-600 
                ${flippedStates[index] ? 'invisible' : 'visible'}
              `}
              style={{ 
                transform: 'rotateY(0deg)',
                backfaceVisibility: 'hidden',
              }}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-4 sm:p-6">
                <div className="text-sm text-muted-foreground mb-2">Term</div>
                <div className="text-lg sm:text-2xl font-semibold text-center">
                  {flashcard.term}
                </div>
                <div className="text-sm text-muted-foreground mt-4">
                  Click to flip
                </div>
              </CardContent>
            </Card>

            {/* Back of card */}
            <Card 
              className={`
                absolute inset-0 w-full h-full 
                transition-transform duration-600 
                ${flippedStates[index] ? 'visible' : 'invisible'}
              `}
              style={{ 
                transform: 'rotateY(180deg)',
                backfaceVisibility: 'hidden',
              }}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-4 sm:p-6">
                <div className="text-sm text-muted-foreground mb-2">Definition</div>
                <div className="text-lg sm:text-2xl font-semibold text-center">
                  {flashcard.definition}
                </div>
                <div className="text-sm text-muted-foreground mt-4">
                  Click to flip
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${className}`}>
      <BaseCarousel
        items={flashcards}
        currentIndex={currentIndex}
        onIndexChange={handleIndexChange}
        renderItem={renderFlashcard}
        className="mb-8"
      />
      
      {currentIndex === flashcards.length - 1 && (
        <div className="flex justify-center">
          <Button 
            onClick={onComplete}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 mb-4"
          >
            Ready for Quiz
          </Button>
        </div>
      )}
    </div>
  );
};

export default FlashcardCarousel;