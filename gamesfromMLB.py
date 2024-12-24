import requests
import json
#https://gist.github.com/akeaswaran/b48b02f1c94f873c6655e7129910fc3b


'''
Data set for more updated information, (like recent insights and shit). What soft knowledge do we need?
Maybe just use ChatGPT (OpenAI) for open knowledge
'''
def get_mlb_scores():
    url = "http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        return None


def get_mlb_team_data(data):
    #gets the teamDataApi Key among others things
    #returns 2D dictionary with: official team name as the key, logo link, team abbreivation and teamurl as the values of the key (in a dictionary, describing what it is)
    retDict = dict()
    
    #change the number before teams
    path = data['sports'][0]['leagues'][0]['teams']
    for i in range(len(path)):
        find = path[i]['team']
        abi = find['abbreviation']
        slugDisplay = find['slug']
        teamUrl = f"https://www.espn.com/mlb/team/stats/_/name/{abi}/{slugDisplay}"
        teamLogo = f"https://a.espncdn.com/i/teamlogos/mlb/500/scoreboard/{abi}.png" #abritatry link for logo
        retDict[find['displayName']] = {'Logo': teamLogo, 'teamAbbreviation': abi.lower(), 'teamUrl': teamUrl}
    return retDict
    
    

data = get_mlb_scores()
dict = get_mlb_team_data(data)

print(dict)


