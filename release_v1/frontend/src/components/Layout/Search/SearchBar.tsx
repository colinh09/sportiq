import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { preferencesApi } from "@/lib/api/preferences";
import debounce from "lodash/debounce";
import { useRouter } from "next/navigation";

interface SearchResult {
  value: string;
  type: 'team' | 'player';
  id: string | number;
  teamId?: string | number;
  keywords: string[];
}

interface SearchBarProps {
  userId?: string;
}

export const SearchBar = ({ userId }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<{
    teams: number[];
    players: number[];
  }>({
    teams: [],
    players: []
  });
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const fetchPreferences = async () => {
      try {
        const [teamsResponse, playersResponse] = await Promise.all([
          preferencesApi.getTeamPreferences(userId),
          preferencesApi.getPlayerPreferences(userId)
        ]);

        // Extract IDs from the nested data structure
        // this is bad doing casting of type any but need to move quick right now
        const teamIds = teamsResponse.data.map((team: any) => team.teamId);
        const playerIds = playersResponse.data.map((player: any) => player.playerId);

        setPreferences({
          teams: teamIds,
          players: playerIds
        });
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
        setPreferences({ teams: [], players: [] });
      }
    };

    fetchPreferences();
  }, [userId]);

  const performSearch = useCallback(
    debounce(async (value: string) => {
      if (!value) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/search?keywords=${encodeURIComponent(value)}`);
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
    []
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsLoading(true);
    performSearch(value);
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
      } else {
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
      }
    } catch (error) {
      console.error("Failed to update preference:", error);
    }
  };

  const isItemInList = (result: SearchResult): boolean => {
    if (result.type === 'team') {
      return preferences.teams.includes(Number(result.id));
    }
    return preferences.players.includes(Number(result.id));
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input 
        value={query}
        placeholder="Search teams, players..." 
        className="pl-8 w-full"
        onChange={handleSearch}
      />
      
      {query && (
        <div className="absolute top-full mt-1 w-full bg-background border rounded-md shadow-lg max-h-96 overflow-auto z-50">
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
                      } else if (result.teamId) {
                        router.push(`/teams/${result.teamId}`);
                      }
                    }}
                  >
                    {result.value} ({result.type})
                  </span>
                  {userId && (
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
  );
};
