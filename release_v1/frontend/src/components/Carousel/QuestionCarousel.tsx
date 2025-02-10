import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import BaseCarousel from './BaseCarousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Question } from '@/lib/api/types';

interface QuestionCarouselProps {
  questions: Question[];
  onComplete?: (score: number) => void;
  onAnswerSubmit?: (isCorrect: boolean) => void;
  className?: string;
}

interface QuestionState {
  selectedAnswer: number | null;
  isSubmitted: boolean;
}

const QuestionCarousel: React.FC<QuestionCarouselProps> = ({
  questions,
  onComplete,
  onAnswerSubmit,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    questions.map(() => ({ selectedAnswer: null, isSubmitted: false }))
  );

  const handleAnswerSelect = (answerIndex: number) => {
    if (questionStates[currentIndex].isSubmitted) return;

    setQuestionStates(prev => {
      const newStates = [...prev];
      newStates[currentIndex] = {
        ...newStates[currentIndex],
        selectedAnswer: answerIndex
      };
      return newStates;
    });
  };

  const handleSubmit = () => {
    const currentQuestion = questions[currentIndex];
    const currentState = questionStates[currentIndex];
    const isCorrect = currentState.selectedAnswer === currentQuestion.correct_option_index;

    if (onAnswerSubmit) {
      onAnswerSubmit(isCorrect);
    }

    setQuestionStates(prev => {
      const newStates = [...prev];
      newStates[currentIndex] = {
        ...newStates[currentIndex],
        isSubmitted: true
      };
      return newStates;
    });
  };

  const getScore = useCallback(() => {
    return questions.reduce((score, question, index) => {
      const state = questionStates[index];
      return score + (state.selectedAnswer === question.correct_option_index ? 1 : 0);
    }, 0);
  }, [questions, questionStates]);

  const renderQuestion = (question: Question, index: number) => {
    const state = questionStates[index];
    const options = [
      question.option1,
      question.option2,
      question.option3,
      question.option4
    ];

    return (
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
        <Card className="w-full">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Question text with proper wrapping */}
              <div className="text-base sm:text-lg font-semibold whitespace-pre-wrap break-words">
                {question.content}
              </div>

              {/* Options Grid - 2 columns on larger screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((option, optionIndex) => {
                  const isSelected = state.selectedAnswer === optionIndex;
                  const isCorrect = optionIndex === question.correct_option_index;
                  const showResult = state.isSubmitted;
                  // Check if this is in the first column (even index)
                  const isFirstColumn = optionIndex % 2 === 0;
                  // Get the paired option for height comparison (if this is first column)
                  const pairedOption = isFirstColumn && optionIndex + 1 < options.length ? options[optionIndex + 1] : null;
                  // Estimate if either option in the pair needs multiple lines (rough estimate based on length)
                  const needsExtraSpace = isFirstColumn && pairedOption && 
                    (option.length > 50 || pairedOption.length > 50);

                  return (
                    <motion.div
                      key={optionIndex}
                      initial={false}
                      animate={{ scale: isSelected ? 1.02 : 1 }}
                    >
                      <Button
                        variant="outline"
                        className={`
                          w-full min-h-[2.5rem] py-2 px-3 h-auto text-left justify-start relative text-sm
                          whitespace-pre-wrap break-words
                          ${needsExtraSpace ? 'min-h-[3.5rem]' : ''}
                          ${isSelected ? 'ring-2 ring-primary' : ''}
                          ${showResult && isCorrect ? 'bg-green-100 border-green-500 dark:bg-green-900/20' : ''}
                          ${showResult && isSelected && !isCorrect ? 'bg-red-100 border-red-500 dark:bg-red-900/20' : ''}
                        `}
                        onClick={() => handleAnswerSelect(optionIndex)}
                        disabled={state.isSubmitted}
                      >
                        <span className="mr-2 flex-none">{String.fromCharCode(65 + optionIndex)}.</span>
                        <span className="flex-1 min-w-0">{option}</span>
                        {showResult && (isCorrect || (isSelected && !isCorrect)) && (
                          <span className="flex-none ml-2">
                            {isCorrect ? (
                              <CheckCircle2 className="text-green-500 h-4 w-4" />
                            ) : (
                              <XCircle className="text-red-500 h-4 w-4" />
                            )}
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Submit button or feedback */}
              <div className="mt-4">
                {!state.isSubmitted ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={state.selectedAnswer === null}
                    className="bg-primary"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                    <div className={`text-sm sm:text-base font-medium ${
                      state.selectedAnswer === question.correct_option_index
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {state.selectedAnswer === question.correct_option_index
                        ? 'Correct!'
                        : 'Incorrect - ' + String.fromCharCode(65 + question.correct_option_index)}
                    </div>
                    {currentIndex < questions.length - 1 && (
                      <Button
                        onClick={() => {
                          setCurrentIndex(prev => prev + 1);
                        }}
                        className="bg-primary"
                      >
                        Next Question
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Check if all questions have been answered
  const allAnswered = questionStates.every(state => state.isSubmitted);

  return (
    <div className={`${className}`}>
      <BaseCarousel
        items={questions}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
        renderItem={renderQuestion}
        showNavigation={!questionStates[currentIndex].isSubmitted}
      />
      
      {allAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 mt-6"
        >
          <div className="text-lg sm:text-xl font-bold text-center">
            Quiz Complete! Score: {getScore()}/{questions.length}
          </div>
          {onComplete && (
            <Button 
              onClick={() => onComplete(getScore())}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 mb-4"
            >
              Complete Module
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default QuestionCarousel;