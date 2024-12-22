import requests
import json
#https://gist.github.com/akeaswaran/b48b02f1c94f873c6655e7129910fc3b


'''
Data set for more updated information, (like recent insights and shit). What soft knowledge do we need?
Maybe just use ChatGPT (OpenAI) for open knowledge
'''
def get_mlb_scores():
    url = "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        return None


def print_scores(data):
    if data and 'events' in data:
        for game in data['events']:
            print(json.dumps(game, indent=2))
    print(data.keys())

def get_mlb_team_stats():
    # Base URL for MLB team stats
    url = "http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams"
    

    # Make the request
    response = requests.get(url)
    response.raise_for_status()
    
    # Parse the response
    data = response.json()
    abbrev = []
    displayNames = []
    #change the number before teams
    path = data['sports'][0]['leagues'][0]['teams']
    for i in range(len(path)):
        find = path[i]
        print(find)
        print(find.keys())
    teams = []

scores = get_mlb_scores()
sc = get_mlb_team_stats()
#print_scores(scores)
