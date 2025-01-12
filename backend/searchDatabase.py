import duckdb
from gamesFromMLB import return_team_list, get_mlb_scores, get_mlb_team_data, get_all_players_list

def _initialize_teams_table(con):
    allTeamData = return_team_list()
    con.sql("CREATE TABLE IF NOT EXISTS Teams (Logo VARCHAR, teamAbbreviation VARCHAR, \
            teamUrl VARCHAR, teamSchedule VARCHAR, rosterUrl VARCHAR, \
            lastYearSchedule VARCHAR, displayName VARCHAR PRIMARY KEY)")
    if (con.sql("SELECT COUNT(*) FROM Teams").fetchall()) == len(allTeamData):
        return
    
    columns = allTeamData[0].keys()
    columnNames = ", ".join(columns)
    placeholders = ", ".join(["?"] * len(columns))

    query = f"INSERT INTO teams ({columnNames}) VALUES ({placeholders})"
    values = [tuple(team[col] for col in columns) for team in allTeamData]

    con.executemany(query, values)

def _initialize_players_table(con):
    MLBdata = get_mlb_team_data(get_mlb_scores())
    allPlayers = get_all_players_list(MLBdata)
    con.sql("CREATE TABLE IF NOT EXISTS Players (name VARCHAR, position VARCHAR, \
            headshotUrl VARCHAR, team VARCHAR, listings VARCHAR[])")
    if (con.sql("SELECT COUNT(*) FROM Players").fetchall()) == len(allPlayers):
        return
    
    columns = ['name', 'position', 'headshotUrl', 'listings']
    columnNames = ", ".join(columns)
    placeholders = ", ".join(["?"] * len(columns))

    query = f"INSERT INTO teams ({columnNames}) VALUES ({placeholders})"
    
    con.executemany(query, allPlayers)

def _initialize_db():
    with duckdb.connect("database.db") as con:
        _initialize_teams_table(con)
        _initialize_players_table(con)