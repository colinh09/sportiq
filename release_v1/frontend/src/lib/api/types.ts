export interface Team {
    teamId: string;
    Logo: string;
    teamAbbreviation: string;
    teamUrl: string;
    teamSchedule: string;
    rosterUrl: string;
    lastYearSchedule: string;
    displayName: string;
  }
  
  export interface Player {
    playerId: number;
    name: string;
    position: string;
    headshotUrl: string;
    teamId: string;
    position_code: string;
  }
  
  export interface Game {
    gameId: number;
    teamId: string;
    opponent: string;
    date: string;
    won: boolean;
    teamScore: number;
    opponentScore: number;
  }
  
  export interface UpcomingGame {
    teamId: string;
    opponent: string;
    date: string;
  }
  
  export interface TeamRecord {
    teamId: string;
    win: number;
    loss: number;
  }
  
  export interface TeamDetails {
    teamInfo: Team;
    players: Player[];
    leaders: [string, string, string][]; // [playerName, role, headshotUrl]
    standing: string;
    games: Game[];
    upcomingGames: UpcomingGame[];
    record: TeamRecord;
  }
  
  export interface SearchResult {
    value: string;
    type: "player" | "team";
    keywords: string[];
  }
  
  export interface ApiError {
    error: string;
    status: number;
  }
  
  // Adding response types for better type safety
  export interface ApiResponse<T> {
    data: T;
  }

  