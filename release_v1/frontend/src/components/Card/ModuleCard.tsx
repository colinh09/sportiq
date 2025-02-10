import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Module, ModuleTopic } from '@/lib/api/types';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/hooks/use-toast';
import { modulesApi } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

// Define the extended module type needed for the card
export interface ModuleWithDetails extends Module {
  creator_username: string;
  status?: boolean;
}

interface ModuleCardProps {
  module: ModuleWithDetails;
  onDelete?: () => void;
}

const difficultyMap = {
  0: { label: 'Beginner', color: 'bg-green-100 text-green-800' },
  1: { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  2: { label: 'Advanced', color: 'bg-red-100 text-red-800' }
};

const ModuleCard = ({ module, onDelete }: ModuleCardProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const difficultyInfo = difficultyMap[module.difficulty as keyof typeof difficultyMap];

  const handleClick = () => {
    router.push(`/modules/${module.moduleId}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      await modulesApi.deleteUserModule(user.id, module.moduleId);
      toast({
        title: "Success",
        description: "Module removed successfully",
      });
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.error || "Failed to delete module",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-semibold line-clamp-1">{module.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`${difficultyInfo.color} whitespace-nowrap`}
            >
              {difficultyInfo.label}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Created by {module.creator_username}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="capitalize">
            {module.topic}
          </Badge>
          {module.status !== undefined && (
            <Badge 
              variant="secondary"
              className={module.status ? "bg-green-100 text-green-800" : ""}
            >
              {module.status ? "Completed" : "In Progress"}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {module.concept}
        </p>
      </CardContent>

      <CardFooter>
        <Button 
          onClick={handleClick}
          className="w-full"
          variant="outline"
        >
          {module.status ? "Review Module" : "Start Learning"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModuleCard;