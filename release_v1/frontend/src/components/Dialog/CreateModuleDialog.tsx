import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { ModuleTopic } from '@/lib/api/types';
import { modulesApi } from '@/lib/api';
import { Plus, AlertCircle } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CreateModuleDialogProps {
  onModuleCreated?: () => void;
}

const CreateModuleDialog = ({ onModuleCreated }: CreateModuleDialogProps) => {
  const { toast } = useToast();
  const { user, isAuthenticated, canCreateMoreModules, moduleCreationLimit, modulesCreated } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    topic: '' as ModuleTopic,
    concept: '',
    difficulty: '' as string
  });

  const topics: ModuleTopic[] = ['player', 'team', 'rule', 'tournament', 'position'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a module",
        variant: "destructive",
      });
      return;
    }

    if (!canCreateMoreModules) {
      toast({
        title: "Error",
        description: `You've reached your limit of ${moduleCreationLimit} modules`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      await modulesApi.createModule({
        ...formData,
        userId: user.id,
        difficulty: parseInt(formData.difficulty) as 0 | 1 | 2
      });
      
      toast({
        title: "Success!",
        description: "Your module has been created.",
      });
      
      // Reset form and close dialog
      setFormData({
        title: '',
        topic: '' as ModuleTopic,
        concept: '',
        difficulty: ''
      });
      setOpen(false);

      // Notify parent component
      onModuleCreated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.error || "Failed to create module",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!canCreateMoreModules) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              className="gap-2 cursor-not-allowed opacity-70" 
              variant="secondary" 
              onClick={(e) => e.preventDefault()}
            >
              <AlertCircle size={20} />
              Create Module
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>You've reached your limit of {moduleCreationLimit} modules</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={20} />
          Create Module ({modulesCreated}/{moduleCreationLimit})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Learning Module</DialogTitle>
          <DialogDescription>
            Create a new baseball learning module with AI-generated content
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Module Title</Label>
            <Input
              id="title"
              placeholder="Enter module title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Select
              value={formData.topic}
              onValueChange={(value) => setFormData({ ...formData, topic: value as ModuleTopic })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic.charAt(0).toUpperCase() + topic.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="concept">Concept</Label>
            <Input
              id="concept"
              placeholder="Enter the specific concept"
              value={formData.concept}
              onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Beginner</SelectItem>
                <SelectItem value="1">Intermediate</SelectItem>
                <SelectItem value="2">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !isAuthenticated}
          >
            {loading ? "Creating Module..." : "Create Module"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateModuleDialog;