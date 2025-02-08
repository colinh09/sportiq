import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SidebarItem as SidebarItemType } from './Sidebar';

interface SidebarItemProps {
  item: SidebarItemType;
  isActive: boolean;
  onClick: () => void;
}

export const SidebarItem = ({
  item,
  isActive,
  onClick
}: SidebarItemProps) => {
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className="w-full justify-start"
      onClick={onClick}
    >
      {item.label}
    </Button>
  );
};