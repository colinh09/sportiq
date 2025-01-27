import duckdb
from gamesFromMLB import return_team_list, get_mlb_scores, get_mlb_team_data, get_all_players_list, game_history_five, next_game_team
from datetime import datetime
import numpy as np

mlb_data_dict = get_mlb_team_data(get_mlb_scores())

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
        con.sql("DELETE FROM Teams")
    
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
    con.sql("CREATE TABLE IF NOT EXISTS Records (team VARCHAR, win INTEGER, loss INTEGER)")
    con.sql("DELETE FROM Records")

    columnsGames = ['gameId', 'team', 'opponent', 'date', 'won', 'teamScore', 'opponentScore']
    columnsRecords = ['team', 'win', 'loss']
    gamesList = []
    recordsList = []
    gameId = 0

    allTeamNames = map(lambda team: team['displayName'], return_team_list())

    for team in allTeamNames:
        games_dict = game_history_five(mlb_data_dict, team, mlb_data_dict[team]['lastYearSchedule'])

        # Record formatting
        recordData = games_dict[0]['record'].split('-')
        recordTuple = (team, recordData[0], recordData[1])
        recordsList.append(recordTuple)

        curGameList = games_dict[1:]
        # For loop for formatting
        for game in curGameList:
            game['team'] = team
            parsed_date = datetime.strptime(game['date'], '%a, %b %d').replace(year=2024)
            game['date'] = parsed_date.strftime(f'%Y-%m-%d')
            game['gameId'] = gameId
            game['won'] = (game['game result'][0] == "W")
            scoring = game['game result'][1:].split('-')
            game['teamScore'] = scoring[0]
            game['opponentScore'] = scoring[1].split(' ')[0] # We need to do this extra split because 'F/13' is sometimes tacked on the end to indicate that the game had 13 innings

            gameTuple = tuple(game[col] for col in columnsGames)

            # Below avoids repeating games
            # ['gameId', 'team', 'opponent', 'date', 'won', 'team-score', 'opponent-score']
            if any(tup[1] == gameTuple[2] and tup[3] == gameTuple[3] and tup[5] == gameTuple[6] for tup in gamesList):
                pass
            else:
                gamesList.append(gameTuple)
                gameId += 1

    columnNames = ", ".join(columnsGames)
    placeholders = ", ".join(["?"] * len(columnsGames))
    query = f"INSERT INTO Games ({columnNames}) VALUES ({placeholders})"
    con.executemany(query, gamesList)

    columnNames = ", ".join(columnsRecords)
    placeholders = ", ".join(["?"] * len(columnsRecords))
    query = f"INSERT INTO Records ({columnNames}) VALUES ({placeholders})"
    con.executemany(query, recordsList)


def _initialize_upcoming_games_table(con):
    allTeamData = return_team_list()
    allTeamNames = map(lambda team: team['displayName'], allTeamData)
    con.sql("CREATE TABLE IF NOT EXISTS UpcomingGames (team VARCHAR, opponent VARCHAR, \
             date VARCHAR)")
    num_entries = con.sql("SELECT COUNT(*) FROM UpcomingGames").fetchall()[0][0]
    if num_entries == len(allTeamData):
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
        #_initialize_teams_table(con)
        #_initialize_players_table(con)
        #_initialize_games_tables(con)
        _initialize_upcoming_games_table(con)


def test_db(tables):
    with duckdb.connect("database.db") as con:
        for table in tables:
            print(f"---------------Testing {table} table:---------------\n")
            num_rows = con.sql(f"SELECT COUNT(*) FROM {table}").fetchall()[0][0]
            print(f"{num_rows} rows")
            random_sample = con.sql(f"SELECT * FROM {table} USING SAMPLE 10").fetchall()
            print(f"Random sample of rows:\n{random_sample}\n\n")

def fetch_team(teamName):
    with duckdb.connect("database.db") as con:
        query = f"SELECT * FROM Teams WHERE displayName = '{teamName}'"
        df = con.execute(query).fetchdf()
        result = df.to_dict(orient="records")

    return result       

def fetch_player(playerName):
    with duckdb.connect("database.db") as con:
        query = f"SELECT * FROM Players WHERE name = '{playerName}'"
        df = con.execute(query).fetchdf()
        result = df.to_dict(orient="records")
    
    for player in result:
        if isinstance(player['listings'], np.ndarray):
            player['listings'] = player['listings'].tolist()

    return result

def fetch_players(teamName):
    with duckdb.connect("database.db") as con:
        query = f"SELECT * FROM Players WHERE team = '{teamName}'"
        df = con.execute(query).fetchdf()
        result = df.to_dict(orient="records")

    for player in result:
        if isinstance(player['listings'], np.ndarray):
            player['listings'] = player['listings'].tolist()

    return result

def fetch_games(teamName, hasHappened):
    with duckdb.connect("database.db") as con:
        query = ""
        if hasHappened:
            query = f"SELECT * FROM Games WHERE team = '{teamName}'"
        else:
            query = f"SELECT * FROM UpcomingGames WHERE team = '{teamName}'"
        df = con.execute(query).fetchdf()
        result = df.to_dict(orient="records")

    return result

def fetch_record(teamName):
    with duckdb.connect("database.db") as con:
        query = f"SELECT * FROM Records WHERE team = '{teamName}'"
        df = con.execute(query).fetchdf()
        result = df.to_dict(orient="records")
    
    return result

def fetch_team_list():
    with duckdb.connect("database.db") as con:
        df = con.execute("SELECT * from Teams").fetchdf()
        result = df.to_dict(orient="records")

    return result

#_initialize_db()
#test_db(['Players', 'Teams', 'Games', 'Records', 'UpcomingGames'])