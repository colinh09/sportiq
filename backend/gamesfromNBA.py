from nba_api.stats.endpoints import playercareerstats
from nba_api.stats.endpoints import leaguegamefinder
from nba_api.stats.endpoints import leaguestandings

'''
Most likely what we would use. No underdog data. More for past information.
'''
# Nikola Jokić
#players.findplayersbyname
career = playercareerstats.PlayerCareerStats(player_id='203999')

# pandas data frames (optional: pip install pandas)
career.get_data_frames()[0]

# json
career.get_json()

# dictionary
print(career.get_data_frames()[0])

def get_season_games(season):
    gamefinder = leaguegamefinder.LeagueGameFinder(
        season_nullable=season,
        league_id_nullable='00'  # nba league id
    )
    games = gamefinder.get_data_frames()[0]
    return games

#1990-91 season
season_games = get_season_games('2024-25')
print(season_games)