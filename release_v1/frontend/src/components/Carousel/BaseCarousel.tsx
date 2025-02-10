// BaseCarousel.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BaseCarouselProps<T> {
  items: T[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  showNavigation?: boolean;
  showProgress?: boolean;
  className?: string;
}

const BaseCarousel = <T,>({
  items,
  currentIndex: controlledIndex,
  onIndexChange,
  renderItem,
  showNavigation = true,
  showProgress = true,
  className = ''
}: BaseCarouselProps<T>) => {
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const handleIndexChange = useCallback((newIndex: number) => {
    if (onIndexChange) {
      onIndexChange(newIndex);
    } else {
      setInternalIndex(newIndex);
    }
  }, [onIndexChange]);

  const goToNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % items.length;
    handleIndexChange(nextIndex);
  }, [currentIndex, items.length, handleIndexChange]);

  const goToPrevious = useCallback(() => {
    const previousIndex = (currentIndex - 1 + items.length) % items.length;
    handleIndexChange(previousIndex);
  }, [currentIndex, items.length, handleIndexChange]);

  const goToIndex = useCallback((index: number) => {
    handleIndexChange(index);
  }, [handleIndexChange]);

  if (!items.length) {
    return null;
  }

  return (
    <div className={`relative w-full h-full flex flex-col ${className}`}>
      {/* Content container with constrained height */}
      <div className="flex-1 min-h-0 flex items-center justify-center mb-8">
        {/* Current item with constrained size */}
        <div className="w-4/5 h-[50vh] md:h-[50vh] max-h-[400px]">
          <div className="h-full w-full flex items-center justify-center">
            {renderItem(items[currentIndex], currentIndex)}
          </div>
        </div>
      </div>

      {/* Controls container - fixed height section */}
      <div className="flex-none">
        {/* Navigation buttons */}
        {showNavigation && items.length > 1 && (
          <div className="flex justify-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              aria-label="Previous item"
              className="bg-background/80 backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              aria-label="Next item"
              className="bg-background/80 backdrop-blur-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Progress indicators */}
        {showProgress && items.length > 1 && (
          <div className="flex justify-center items-center gap-2 mb-3">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-primary w-4' 
                    : 'bg-muted hover:bg-muted-foreground'
                }`}
                aria-label={`Go to item ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Progress text */}
        {showProgress && (
          <div className="text-center text-sm text-muted-foreground">
            {currentIndex + 1} of {items.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseCarousel;