import { useState, useCallback, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { preferencesApi } from "@/lib/api/preferences";
import { modulesApi } from "@/lib/api";
import debounce from "lodash/debounce";
import { useRouter } from "next/navigation";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface SearchResult {
  value: string;
  type: 'team' | 'player' | 'module';
  id: string | number;
  teamId?: string | number;
  keywords: string[];
  creator?: string;
  isUser?: boolean;
}

interface SearchBarProps {
  userId?: string;
  defaultType?: 'players' | 'teams' | 'modules';
}

export const SearchBar = ({ 
  userId, 
  defaultType = 'players'
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<'players' | 'teams' | 'modules'>(defaultType);
  const [showResults, setShowResults] = useState(false);
  const [preferences, setPreferences] = useState<{
    teams: number[];
    players: number[];
    modules: number[];
  }>({
    teams: [],
    players: [],
    modules: []
  });
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle clicking outside of search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lazy load preferences only when needed
  const loadPreferences = async () => {
    if (!userId || preferencesLoaded) return;

    try {
      const [teamsResponse, playersResponse, modulesResponse] = await Promise.all([
        preferencesApi.getTeamPreferences(userId),
        preferencesApi.getPlayerPreferences(userId),
        modulesApi.getUserModules({ userId, limit: 1000 }) // Get all user modules
      ]);

      const teamIds = teamsResponse.data.map((team: any) => team.teamId);
      const playerIds = playersResponse.data.map((player: any) => player.playerId);
      const moduleIds = modulesResponse.modules.map(module => module.moduleId);

      setPreferences({
        teams: teamIds,
        players: playerIds,
        modules: moduleIds
      });
      setPreferencesLoaded(true);
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
      setPreferences({ teams: [], players: [], modules: [] });
    }
  };

  const performSearch = useCallback(
    debounce(async (value: string) => {
      if (!value) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(
          `/api/search?keywords=${encodeURIComponent(value)}&type=${searchType}`
        );
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [searchType]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsLoading(true);
    setShowResults(true);
    performSearch(value);
  };

  const handleFocus = () => {
    setShowResults(true);
    if (userId) {
      loadPreferences();
    }
  };

  const handleTogglePreference = async (result: SearchResult) => {
    if (!userId) return;
    
    try {
      if (result.type === 'team') {
        const teamId = Number(result.id);
        const isAdded = preferences.teams.includes(teamId);
        
        if (isAdded) {
          await preferencesApi.removeTeamPreference(userId, teamId.toString());
          setPreferences(prev => ({
            ...prev,
            teams: prev.teams.filter(t => t !== teamId)
          }));
        } else {
          await preferencesApi.addTeamPreference(userId, teamId.toString());
          setPreferences(prev => ({
            ...prev,
            teams: [...prev.teams, teamId]
          }));
        }
      } else if (result.type === 'player') {
        const playerId = Number(result.id);
        const isAdded = preferences.players.includes(playerId);
        
        if (isAdded) {
          await preferencesApi.removePlayerPreference(userId, playerId);
          setPreferences(prev => ({
            ...prev,
            players: prev.players.filter(p => p !== playerId)
          }));
        } else {
          await preferencesApi.addPlayerPreference(userId, playerId);
          setPreferences(prev => ({
            ...prev,
            players: [...prev.players, playerId]
          }));
        }
      } else if (result.type === 'module' && !result.isUser) {
        const moduleId = Number(result.id);
        const isAdded = preferences.modules.includes(moduleId);
        
        if (isAdded) {
          await modulesApi.deleteUserModule(userId, moduleId);
          // Refresh the modules list to ensure we have the latest state
          const modulesResponse = await modulesApi.getUserModules({ userId, limit: 1000 });
          setPreferences(prev => ({
            ...prev,
            modules: modulesResponse.modules.map(module => module.moduleId)
          }));
        } else {
          await modulesApi.addUserModule(userId, moduleId);
          // Refresh the modules list to ensure we have the latest state
          const modulesResponse = await modulesApi.getUserModules({ userId, limit: 1000 });
          setPreferences(prev => ({
            ...prev,
            modules: modulesResponse.modules.map(module => module.moduleId)
          }));
        }
      }
    } catch (error) {
      console.error("Failed to update preference:", error);
    }
  };

  const isItemInList = (result: SearchResult): boolean => {
    if (!preferencesLoaded) return false;
    
    if (result.type === 'team') {
      return preferences.teams.includes(Number(result.id));
    }
    if (result.type === 'player') {
      return preferences.players.includes(Number(result.id));
    }
    if (result.type === 'module' && !result.isUser) {
      return preferences.modules.includes(Number(result.id));
    }
    return false;
  };

  const getPlaceholderText = () => {
    switch (searchType) {
      case 'players':
        return "Search players...";
      case 'teams':
        return "Search teams...";
      case 'modules':
        return "Search modules, users...";
      default:
        return "Search...";
    }
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="flex items-center space-x-2">
        <Select 
          value={searchType} 
          onValueChange={(value) => {
            setSearchType(value as typeof searchType);
            // Reset query and results when changing search type
            setQuery("");
            setResults([]);
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Search type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="players">Players</SelectItem>
            <SelectItem value="teams">Teams</SelectItem>
            <SelectItem value="modules">Modules</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            ref={inputRef}
            value={query}
            placeholder={getPlaceholderText()} 
            className="pl-8 w-full"
            onChange={handleSearch}
            onFocus={handleFocus}
          />
          
          {showResults && query && (
            <div 
              className="absolute top-full mt-1 w-full bg-background border rounded-md shadow-lg max-h-96 overflow-auto z-50"
              style={{
                width: inputRef.current ? `${inputRef.current.offsetWidth}px` : 'auto'
              }}
            >
              {isLoading ? (
                <div className="p-2 text-sm text-muted-foreground">Searching...</div>
              ) : results.length > 0 ? (
                <div>
                  {results.map(result => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className="px-2 py-1.5 hover:bg-accent flex justify-between items-center"
                    >
                      <span 
                        className="cursor-pointer"
                        onClick={() => {
                          if (result.type === 'team') {
                            router.push(`/teams/${result.id}`);
                          } else if (result.type === 'player' && result.teamId) {
                            router.push(`/teams/${result.teamId}`);
                          } else if (result.type === 'module') {
                            if (result.isUser) {
                              // If it's a user result, show their created modules
                              router.push(`/modules?creator=${result.id}`);
                            } else {
                              // If it's a module, go to specific module
                              router.push(`/modules/${result.id}`);
                            }
                          }
                        }}
                      >
                        {result.value}
                      </span>
                      {userId && (result.type !== 'module' || !result.isUser) && (
                        <Button
                          variant={isItemInList(result) ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleTogglePreference(result)}
                        >
                          {isItemInList(result) ? "Remove" : "Add"}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 text-sm text-muted-foreground">No results found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};