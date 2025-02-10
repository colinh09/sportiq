'use client';

import React, { useEffect, useState } from 'react';
import { modulesApi } from '@/lib/api';
import { ModuleWithDetails } from '@/components/Card/ModuleCard';
import ModuleCard from '@/components/Card/ModuleCard';
import CreateModuleDialog from '@/components/Dialog/CreateModuleDialog';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/components/ui/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Grid from '@/components/Grid/Grid';

interface ModulesMetadata {
  total_count: number;
  current_page: number;
  total_pages: number;
  has_more: boolean;
}

export default function ModulesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<ModuleWithDetails[]>([]);
  const [metadata, setMetadata] = useState<ModulesMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'created_at' | 'difficulty' | 'status'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // Handle responsive limit changes
  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.matchMedia('(max-width: 1024px)').matches;
      setItemsPerPage(isSmallScreen ? 6 : 9);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchModules = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await modulesApi.getUserModules({
        userId: user.id,
        page: currentPage,
        limit: itemsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      
      setModules(response.modules);
      setMetadata(response.metadata);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.error || "Failed to fetch modules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [user, currentPage, sortBy, sortOrder, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (!user) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Please log in</h2>
          <p className="text-muted-foreground">You need to be logged in to view your modules</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header Section */}
      <div className="flex-none p-4 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div>
              <h1 className="text-2xl font-bold">My Learning Modules</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {metadata?.total_count 
                  ? `${metadata.total_count} module${metadata.total_count === 1 ? '' : 's'} available`
                  : 'Start your learning journey'}
              </p>
            </div>
            <CreateModuleDialog onModuleCreated={fetchModules} />
          </div>

          <div className="flex gap-2 items-end flex-wrap">
            <div className="space-y-1">
              <Label className="text-sm">Sort by</Label>
              <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                <SelectTrigger className="w-[140px] h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                  <SelectItem value="status">Completion Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-sm">Order</Label>
              <Select value={sortOrder} onValueChange={(value: typeof sortOrder) => setSortOrder(value)}>
                <SelectTrigger className="w-[140px] h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="h-full flex justify-center items-center bg-white rounded-lg shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {modules.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-muted-foreground">
                    No modules to display. Create or add your first module to get started
                  </p>
                </div>
              ) : (
                <>
                  {/* Grid Container */}
                  <Grid className="mb-4">
                    {modules.map((module, index) => (
                      <div key={index} className="bg-white rounded-lg shadow-sm h-full">
                        <ModuleCard 
                          module={module} 
                          onDelete={fetchModules}
                        />
                      </div>
                    ))}
                  </Grid>

                  {/* Pagination */}
                  {metadata && metadata.total_pages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: metadata.total_pages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            size="sm"
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => handlePageChange(page)}
                            className="hidden sm:inline-flex w-8"
                          >
                            {page}
                          </Button>
                        ))}
                        <span className="sm:hidden text-sm">
                          Page {currentPage} of {metadata.total_pages}
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!metadata.has_more}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}