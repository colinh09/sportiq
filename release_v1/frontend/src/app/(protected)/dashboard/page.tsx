'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { preferencesApi } from '@/lib/api/preferences';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CalendarDays, 
  Trophy, 
  Users, 
  BookMarked, 
  GraduationCap,
  BookOpen,
  Edit3,
  BarChart3
} from 'lucide-react';
import { UserTeamPreference, UserPlayerPreference, UserModulePreference, ApiResponse } from '@/lib/api/types';

interface PreferencesState {
  teams: UserTeamPreference[];
  players: UserPlayerPreference[];
  modules: UserModulePreference[];
}

const Dashboard = () => {
  const { 
    user, 
    username, 
    streak, 
    streakUpdatedAt,
    moduleCreationLimit,
    modulesAdded,
    modulesCompleted,
    modulesCreated,
    canCreateMoreModules,
    completionRate
  } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState<PreferencesState>({
    teams: [],
    players: [],
    modules: []
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const [teamPrefs, playerPrefs, modulePrefs] = await Promise.all([
          preferencesApi.getTeamPreferences(user.id),
          preferencesApi.getPlayerPreferences(user.id),
          preferencesApi.getModulePreferences(user.id)
        ]);
        
        setPreferences({
          teams: teamPrefs.data || [],
          players: playerPrefs.data || [],
          modules: modulePrefs.data || []
        });
      } catch (err) {
        setError('Failed to load preferences');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Please sign in to view your dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* User Profile Section */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">
              {username?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CardTitle className="text-2xl">{username || 'User'}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-bold text-lg">{streak}</span>
            <span className="text-sm text-muted-foreground">day streak</span>
          </div>
        </CardHeader>
      </Card>

      {/* Module Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Added Modules
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modulesAdded}</div>
            <Progress className="mt-2" value={modulesCompleted / modulesAdded * 100} />
            <p className="text-xs text-muted-foreground mt-2">
              {modulesCompleted} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Created Modules
            </CardTitle>
            <Edit3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modulesCreated}</div>
            <Progress className="mt-2" value={modulesCreated / moduleCreationLimit * 100} />
            <p className="text-xs text-muted-foreground mt-2">
              {moduleCreationLimit - modulesCreated} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress className="mt-2" value={completionRate} />
            <p className="text-xs text-muted-foreground mt-2">
              {modulesCompleted} of {modulesAdded} modules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Module Limit
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moduleCreationLimit}</div>
            <div className="mt-2">
              <Badge variant={canCreateMoreModules ? "secondary" : "destructive"}>
                {canCreateMoreModules ? "Can Create More" : "Limit Reached"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preferences Tabs */}
      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="mt-4 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <Alert className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <>
            <TabsContent value="teams">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Followed Teams
                  </CardTitle>
                  <CardDescription>Teams you're following</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {preferences.teams.length === 0 ? (
                      <p className="text-muted-foreground">No teams followed yet</p>
                    ) : (
                      preferences.teams.map((pref) => (
                        <div key={pref.teamId} className="flex items-center gap-2 bg-secondary rounded-lg p-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={pref.Teams.Logo} alt={pref.Teams.displayName} />
                            <AvatarFallback>{pref.Teams.teamAbbreviation}</AvatarFallback>
                          </Avatar>
                          <span>{pref.Teams.displayName}</span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="players">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Followed Players
                  </CardTitle>
                  <CardDescription>Players you're following</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {preferences.players.length === 0 ? (
                      <p className="text-muted-foreground">No players followed yet</p>
                    ) : (
                      preferences.players.map((pref) => (
                        <div key={pref.playerId} className="flex items-center gap-2 bg-secondary rounded-lg p-2">
                          <Avatar className="h-8 w-10">
                            <AvatarImage src={pref.Players.headshotUrl} alt={pref.Players.name} />
                            <AvatarFallback>{pref.Players.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span>{pref.Players.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {pref.Players.PlayerPositions.position}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="modules">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookMarked className="h-5 w-5" />
                    Saved Modules
                  </CardTitle>
                  <CardDescription>Your saved learning modules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {preferences.modules.length === 0 ? (
                      <p className="text-muted-foreground">No modules saved yet</p>
                    ) : (
                      preferences.modules.map((pref) => (
                        <div key={pref.moduleId} className="flex items-center gap-2 bg-secondary rounded-lg p-3">
                          <div className="flex flex-col flex-1">
                            <span className="font-medium">{pref.CustomModules.title}</span>
                            <span className="text-sm text-muted-foreground">{pref.CustomModules.concept}</span>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="secondary">{pref.CustomModules.topic}</Badge>
                            <Badge variant="outline">
                              {['Beginner', 'Intermediate', 'Advanced'][pref.CustomModules.difficulty]}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default Dashboard;