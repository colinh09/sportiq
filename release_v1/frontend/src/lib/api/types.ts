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

export interface UserProfile {
  userId: string;
  username: string;
  streak: number;
  streak_updated_at: string;
  module_creation_limit: number;
  modules_added: number;
  modules_completed: number;
  modules_created: number;
  can_create_more_modules: boolean;
  completion_rate: number;
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

export interface Flashcard {
  flashcardId: number;
  term: string;
  definition: string;
  order_index: number;
}

export interface Question {
  questionId: number;
  content: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option_index: number;
  order_index: number;
}

export interface ModuleDetails extends Module {
  creator_username: string;
  status?: boolean;
  flashcards: Flashcard[];
  questions: Question[];
}

export interface ModulesResponse {
  modules: Array<Module & {
    creator_username: string;
    status: boolean;
  }>;
  metadata: {
    total_count: number;
    current_page: number;
    total_pages: number;
    has_more: boolean;
  };
}

export interface SearchResult {
  value: string;
  type: 'team' | 'player' | 'module';
  id: string | number;
  teamId?: string | number;
  keywords: string[];
  creator?: string;
  isUser?: boolean;
}

export interface SearchParams {
  keywords: string;
  type?: 'players' | 'teams' | 'modules';
}
