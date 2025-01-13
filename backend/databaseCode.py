import duckdb
from gamesFromMLB import return_team_list, get_mlb_scores, get_mlb_team_data, get_all_players_list, game_history_five, next_game_team
from datetime import datetime

mlb_data_dict = get_mlb_team_data(get_mlb_scores())

city_to_name = {
    "Arizona": "Arizona Diamondbacks",
    "Atlanta": "Atlanta Braves",
    "Baltimore": "Baltimore Orioles",
    "Boston": "Boston Red Sox",
    "Chicago": "Chicago White Sox", # <-- Need to differentiate
    "Chicago 2": "Chicago Cubs", # <-- Need to differentiate
    "Cincinnati": "Cincinnati Reds",
    "Cleveland": "Cleveland Guardians",
    "Colorado": "Colorado Rockies",
    "Detroit": "Detroit Tigers",
    "Houston": "Houston Astros",
    "Kansas City": "Kansas City Royals",
    "Los Angeles": "Los Angeles Angels", # <-- Need to differentiate
    "Los Angeles 2": "Los Angeles Dodgers", # <-- Need to differentiate
    "Miami": "Miami Marlins",
    "Milwaukee": "Milwaukee Brewers",
    "Minnesota": "Minnesota Twins",
    "New York": "New York Yankees", # <-- Need to differentiate
    "New York 2": "New York Mets", # <-- Need to differentiate
    "Oakland": "Oakland Athletics",
    "Philadelphia": "Philadelphia Phillies",
    "Pittsburgh": "Pittsburgh Pirates",
    "San Diego": "San Diego Padres",
    "San Francisco": "San Francisco Giants",
    "Seattle": "Seattle Mariners",
    "St. Louis": "St. Louis Cardinals",
    "Tampa Bay": "Tampa Bay Rays",
    "Texas": "Texas Rangers",
    "Toronto": "Toronto Blue Jays",
    "Washington": "Washington Nationals"
}

def _initialize_teams_table(con):
    allTeamData = return_team_list()
    con.sql("CREATE TABLE IF NOT EXISTS Teams (Logo VARCHAR, teamAbbreviation VARCHAR, \
            teamUrl VARCHAR, teamSchedule VARCHAR, rosterUrl VARCHAR, \
            lastYearSchedule VARCHAR, displayName VARCHAR PRIMARY KEY)")
    num_entries = con.sql("SELECT COUNT(*) FROM Teams").fetchall()[0][0]
    if num_entries == len(allTeamData):
        print("Skipped creating teams table")
        return
    else:
        con.sql("DELETE FROM Players")
    
    columns = allTeamData[0].keys()
    columnNames = ", ".join(columns)
    placeholders = ", ".join(["?"] * len(columns))

    query = f"INSERT INTO Teams ({columnNames}) VALUES ({placeholders})"
    values = [tuple(team[col] for col in columns) for team in allTeamData]

    con.executemany(query, values)


def _initialize_players_table(con):
    allPlayers = get_all_players_list(mlb_data_dict)
    con.sql("CREATE TABLE IF NOT EXISTS Players (name VARCHAR, position VARCHAR, \
            headshotUrl VARCHAR, team VARCHAR, listings VARCHAR[])")
    num_entries = con.sql("SELECT COUNT(*) FROM Players").fetchall()[0][0]
    if num_entries == len(allPlayers):
        print("Skipped creating players table")
        return
    else:
        con.sql("DELETE FROM Players")
    
    columns = ['name', 'position', 'headshotUrl', 'team', 'listings']
    columnNames = ", ".join(columns)
    placeholders = ", ".join(["?"] * len(columns))

    query = f"INSERT INTO Players ({columnNames}) VALUES ({placeholders})"
    
    con.executemany(query, allPlayers)


# Initializes the records table, and the games tables with the five most recent games
def _initialize_games_tables(con):
    # Games table (only five most recent games of every team)
    con.sql("CREATE TABLE IF NOT EXISTS Games (gameId INTEGER PRIMARY KEY, team VARCHAR, \
            opponent VARCHAR, date VARCHAR, won BOOLEAN, teamScore INTEGER, opponentScore INTEGER)")
    con.sql("DELETE FROM Games")


    # Record table (stores the running wins and losses of each team)
    con.sql("CREATE TABLE IF NOT EXISTS Records (team INTEGER PRIMARY KEY, win VARCHAR, loss INTEGER)")
    con.sql("DELETE FROM Records")

    columns = ['gameId', 'team', 'opponent', 'date', 'won', 'teamScore', 'opponentScore']
    gamesList = []
    recordsList = []
    gameId = 0

    allTeamNames = map(lambda team: team['displayName'], return_team_list())

    for team in allTeamNames:
        games_dict = game_history_five(mlb_data_dict, team, mlb_data_dict[team]['lastYearSchedule'])

        # Record formatting
        recordData = games_dict[0]['record'].split('-')
        recordTuple = tuple(team, recordData[0], recordData[1])
        recordsList.append(recordTuple)

        curGameList = games_dict[1:]
        # For loop for formatting
        for game in curGameList:
            game['team'] = team
            game['opponent'] = city_to_name[game['opponent']] # NEED TO VERIFY THIS FOR ALL TEAMS!
            parsed_date = datetime.strptime(game['date'], '%a, %b %d')
            game['date'] = parsed_date.strftime(f'%Y-%m-%d')
            game['gameId'] = gameId
            game['won'] = (game['game result'][0] == "W")
            scoring = game['game result'][1:].split('-')
            game['teamScore'] = scoring[0]
            game['opponentScore'] = scoring[1]

            gameTuple = tuple(game[col] for col in columns)

            # Below avoids repeating games
            # ['gameId', 'team', 'opponent', 'date', 'won', 'team-score', 'opponent-score']
            if any(tup[1] == gameTuple[2] and tup[3] == gameTuple[3] and tup[5] == gameTuple[6] for tup in gamesList):
                pass
            else:
                gamesList.append(game)
                gameId += 1


def _initialize_upcoming_games_table(con):
    allTeamNames = map(lambda team: team['displayName'], return_team_list())
    con.sql("CREATE TABLE IF NOT EXISTS UpcomingGames (team VARCHAR, opponent VARCHAR, \
             date VARCHAR)")
    num_entries = con.sql("SELECT COUNT(*) FROM UpcomingGames").fetchall()[0][0]
    if num_entries == len(allTeamNames):
        print("Skipped creating upcoming games table")
        return
    else:
        con.sql("DELETE FROM UpcomingGames")

    upcomingGames = []
    columns = ['team', 'opponent', 'date']
    for team in allTeamNames:
        nextGame = next_game_team(mlb_data_dict, team)
        parsed_date = datetime.strptime(nextGame['date'], '%a, %b %d %I:%M %p %Y')
        nextGame['date'] = parsed_date.strftime(f'%Y-%m-%d')
        nextGame['team'] = team
        gameTuple = tuple(nextGame[col] for col in columns)
        upcomingGames.append(gameTuple)
    
    columnNames = ", ".join(columns)
    placeholders = ", ".join(["?"] * len(columns))

    query = f"INSERT INTO UpcomingGames ({columnNames}) VALUES ({placeholders})"
    
    con.executemany(query, upcomingGames)


def _initialize_db():
    with duckdb.connect("database.db") as con:
        _initialize_teams_table(con)
        _initialize_players_table(con)
        _initialize_games_tables(con)
        _initialize_upcoming_games_table(con)

_initialize_db()