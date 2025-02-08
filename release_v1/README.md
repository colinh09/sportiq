# SportIQ API Documentation

## Endpoints

### Get All Teams
`GET /api/teams`

Retrieves a list of all MLB teams.

**Response**
```typescript
{
  data: {
    teamId: string
    Logo: string
    teamAbbreviation: string
    teamUrl: string
    teamSchedule: string
    rosterUrl: string
    lastYearSchedule: string
    displayName: string
  }[]
}
```

### Get Team Details
`GET /api/teams/[teamId]`

Retrieves comprehensive information about a specific team, including roster, leaders, games, and records.

**Parameters**
- `teamId`: string (path parameter)

**Response**
```typescript
{
  teamInfo: {
    teamId: string
    Logo: string
    teamAbbreviation: string
    teamUrl: string
    teamSchedule: string
    rosterUrl: string
    lastYearSchedule: string
    displayName: string
  }
  players: {
    playerId: number
    name: string
    position: string
    headshotUrl: string
    teamId: string
  }[]
  leaders: [string, string, string][] // [playerName, role, headshotUrl]
  standing: string // format: "wins-losses"
  games: {
    gameId: number
    teamId: string
    opponent: string
    date: string
    won: boolean
    teamScore: number
    opponentScore: number
  }[]
  upcomingGames: {
    teamId: string
    opponent: string
    date: string
  }[]
  record: {
    teamId: string
    win: number
    loss: number
  }
}
```

**Error Responses**
- 400: Team ID is missing
- 500: Server error during data fetch

### Search
`GET /api/search`

Performs a case-insensitive search across teams and players.

**Query Parameters**
- `keywords`: string (space-separated search terms)

**Response**
```typescript
{
  data: {
    value: string
    type: "player" | "team"
    keywords: string[]
  }[]
}
```

### Get Learning Streak
`GET /api/streak`

Retrieves the current learning streak for the user.

**Response**
```typescript
number // Currently always returns 1
```

## Common Error Response Format
All endpoints return errors in the following format:
```typescript
{
  error: string
  status: number
}
```