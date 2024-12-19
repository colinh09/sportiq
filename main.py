import requests
import json

def get_nba_scores():
    url = "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        return None


def print_scores(data):
    if data and 'season' in data:
        for game in data['season']:
            print(json.dumps(game, indent=2))
    print(data.keys())


scores = get_nba_scores()
print_scores(scores)
