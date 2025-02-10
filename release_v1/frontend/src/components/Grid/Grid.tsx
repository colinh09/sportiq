import { ReactNode } from 'react';

interface GridProps {
  children: ReactNode;
  className?: string;
}

export const Grid = ({ 
  children, 
  className = ''
}: GridProps) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 ${className}`}>
      {children}
    </div>
  );
};

export default Grid;