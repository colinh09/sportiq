'use client';

import { useState, useCallback } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SidebarContent } from './SidebarContent';

export interface SidebarItem {
  id: string;
  label: string;
  onClick?: () => void;
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  sections: SidebarSection[];
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  footer?: React.ReactNode;
}

export const Sidebar = ({
  sections,
  defaultOpen = true,
  onOpenChange,
  className,
  footer
}: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const handleToggle = useCallback(() => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);
  }, [isOpen, onOpenChange]);

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent 
              sections={sections} 
              isOpen={true} 
              activeItemId={activeItemId} 
              setActiveItemId={setActiveItemId}
              footer={footer} 
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-full transform-gpu transition-all duration-200 ease-in-out lg:flex",
          isOpen ? "w-64" : "w-12",
          className
        )}
      >
        <div className="flex h-full w-full flex-col border-r bg-background">
          <div className={cn(
            "flex h-12 items-center transition-all duration-200",
            isOpen ? "justify-between px-4" : "justify-center"
          )}>
            {isOpen && (
              <h2 className="text-lg font-semibold">Navigation</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              className="hidden lg:flex"
            >
              {isOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
          {isOpen && (
            <SidebarContent 
              sections={sections} 
              isOpen={isOpen} 
              activeItemId={activeItemId}
              setActiveItemId={setActiveItemId}
              footer={footer}
            />
          )}
        </div>
      </aside>
    </>
  );
};