import requests
import json
from bs4 import BeautifulSoup
import pandas as pd
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
        retDict[find['displayName']] = {'Logo': teamLogo, 'teamAbbreviation': abi, 'teamUrl': teamUrl}
    return retDict
    
def get_team_leaders(dict, team):
    # URL for Washington Nationals team stats
    url = dict[team]['teamUrl']
    
    # Send GET request and get the page content
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    response = requests.get(url, headers=headers)
    
    # Parse the HTML content
    
    soup = BeautifulSoup(response.content, 'html.parser')
    script_tags = soup.find_all('script')
    ret = None
    for i in range(len(script_tags)):
        for string in script_tags[i].stripped_strings:
            d = repr(string)
            if 'teamLeaders' in d:
                ret = d
    firstIdx = ret.find('teamLeaders')
    teamleaderInfo = ret[firstIdx:]
    print(teamleaderInfo)
    #bs4 element tag


data = get_mlb_scores()
dict = get_mlb_team_data(data)
get_team_leaders(dict, "Washington Nationals")







