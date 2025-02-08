import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarItem } from './SidebarItem';
import type { SidebarSection } from './Sidebar';

interface SidebarContentProps {
  sections: SidebarSection[];
  isOpen: boolean;
  activeItemId: string | null;
  setActiveItemId: (id: string) => void;
  footer?: React.ReactNode;
}

export const SidebarContent = ({
  sections,
  isOpen,
  activeItemId,
  setActiveItemId,
  footer
}: SidebarContentProps) => {
  return (
    <>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-2">
          {sections.map((section, idx) => (
            <div key={section.title} className="py-2">
              <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    isActive={activeItemId === item.id}
                    onClick={() => {
                      setActiveItemId(item.id);
                      item.onClick?.();
                    }}
                  />
                ))}
              </div>
              {idx < sections.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </div>
      </ScrollArea>
      {footer && (
        <>
          <Separator />
          <div className="p-4">{footer}</div>
        </>
      )}
    </>
  );
};