// Base entities
export interface Team {
  teamId: string;
  Logo: string;
  teamAbbreviation: string;
  teamUrl: string;
  teamSchedule: string;
  rosterUrl: string;
  lastYearSchedule: string;
  displayName: string;
  standing: string;
}

export interface PlayerPosition {
  position_code: string;
  position: string;
}

export interface Player {
  playerId: number;
  name: string;
  headshotUrl: string;
  team: string;
  teamId: string;
  PlayerPositions: PlayerPosition;
}

export type ModuleTopic = 'player' | 'team' | 'rule' | 'tournament' | 'position';

export interface Module {
  moduleId: number;
  title: string;
  topic: ModuleTopic;
  concept: string;
  difficulty: 0 | 1 | 2;
  created_at: string;
}

// User preference types that match the API response
export interface UserTeamPreference {
  userId: string;
  teamId: string;
  Teams: Team;
}

export interface UserPlayerPreference {
  userId: string;
  playerId: number;
  Players: Player;
}

export interface UserModulePreference {
  userId: string;
  moduleId: number;
  status: boolean;
  CustomModules: Module;
}

// API response types
export interface ApiResponse<T> {
  data: T[];
  error?: {
    message: string;
    status: number;
  };
}

export interface ApiError {
  error: string;
  status: number;
}