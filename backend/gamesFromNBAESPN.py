import requests
import json
#https://gist.github.com/akeaswaran/b48b02f1c94f873c6655e7129910fc3b


'''
Data set for more updated information, (like recent insights and shit). What soft knowledge do we need?
Maybe just use ChatGPT (OpenAI) for open knowledge
'''
def get_nba_scores():
    url = "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        return None


def print_scores(data):
    if data and 'leagues' in data:
        for game in data['leagues']:
            print(json.dumps(game, indent=2))
    print(data.keys())


scores = get_nba_scores()
print_scores(scores)
