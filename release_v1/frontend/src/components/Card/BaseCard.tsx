// BaseCard.tsx
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BaseCardProps {
  children: ReactNode;
  onAddToList?: () => void;
  onRemoveFromList?: () => void;
  onClick?: () => void;
  isAdded?: boolean;
  className?: string;
}

export const BaseCard = ({
  children,
  onAddToList,
  onRemoveFromList,
  onClick,
  isAdded = false,
  className = ''
}: BaseCardProps) => {
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    isAdded ? onRemoveFromList?.() : onAddToList?.();
  };

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer hover:shadow-lg transition-shadow ${className}`}
    >
      <CardContent className="p-4">
        {children}
        <Button
          onClick={handleActionClick}
          variant={isAdded ? "destructive" : "default"}
          className="mt-2 w-full"
        >
          {isAdded ? 'Remove from List' : 'Add to List'}
        </Button>
      </CardContent>
    </Card>
  );
};
