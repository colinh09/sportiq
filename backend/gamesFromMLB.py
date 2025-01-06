import requests
import json
from bs4 import BeautifulSoup
import pandas as pd
import time
from datetime import datetime
import re
import pytz
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

def remove_backslashes(obj):
    if isinstance(obj, str):  # If it's a string, replace backslashes
        return obj.replace("\\", "")
    elif isinstance(obj, list):  # If it's a list, process each element
        return [remove_backslashes(item) for item in obj]
    elif isinstance(obj, dict):  # If it's a dictionary, process each key-value pair
        return {key: remove_backslashes(value) for key, value in obj.items()}
    else:  # If it's neither, return the object as is
        return obj

def get_mlb_team_data(data):
    #gets the teamDataApi Key among others things
    #returns 2D dictionary with: official team name as the key, logo link, team abbreivation and teamurl as the values of the key (in a dictionary, describing what it is)
    retDict = {}
    
    #change the number before teams
    path = data['sports'][0]['leagues'][0]['teams']
    for i in range(len(path)):
        find = path[i]['team']
        abi = find['abbreviation']
        slugDisplay = find['slug']
        teamUrl = f"https://www.espn.com/mlb/team/stats/_/name/{abi}/{slugDisplay}"
        teamSchedule = f"https://www.espn.com/mlb/team/schedule/_/name/{abi}" #doing this as a test for my next function for last 5 game history
        

        
        teamLogo = f"https://a.espncdn.com/i/teamlogos/mlb/500/scoreboard/{abi}.png" #abritatry link for logo
        retDict[find['displayName']] = {'Logo': teamLogo, 'teamAbbreviation': abi, 'teamUrl': teamUrl, 'teamSchedule': teamSchedule, 'displayName': find['displayName']}
    return retDict
    
def get_team_leaders_dict(mlb_data_dict, team):
    #can definitelty make this function more efficient
    #returns dictionary of best players on team info, and the ranking of the team in it's region
    url = mlb_data_dict[team]['teamUrl']
    
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
    teamleaderInfo = ret[firstIdx + 13:]
    secondIdx = teamleaderInfo.find("dictionary")
    teamleaderInfoNew = teamleaderInfo[:secondIdx - 2]
    teamleaderInfoNew = remove_backslashes(teamleaderInfoNew.strip())
    print(f"teamLeaderInfoNew: {teamleaderInfoNew}")
    teamleaderInfoParse = json.loads(teamleaderInfoNew)
    leadersParse = teamleaderInfoParse['leaders']
    
    standing_tag = soup.find_all('li')
    standing = None
    for i in range(len(standing_tag)):
        for string in standing_tag[i].stripped_strings:
            d = repr(string)
            if 'NL ' in d or 'AL ' in d:
                standing = d

    return (leadersParse, standing)

    #bs4 element tag

def get_team_leaders(list):
    #returns list of best players with mugshot
    newAthletes = []
    newAthleteInfo = []
    for athlete in list:
        newAddition = athlete['athlete']['name']
        newHeadshot = athlete['athlete']['headshot']
        newPosition = athlete['athlete']['position']
        if newAddition not in newAthletes:
            newAthletes.append(newAddition)
            newAthleteInfo.append((newAddition, newPosition, newHeadshot))
    return newAthleteInfo
def extract_year(url):
    year_match = re.search(r'-(\d{4})--', url)
    return year_match.group(1) if year_match else None


'''

CANT PROMISE THAT THESE TWO FUNCTIONS WORK AS INTENDED, WE DONT KNOW WHAT THE PAGE LOOKS LIKE WHEN THE SEASON STARTS. This is a draft version of these two functions and can be edited later.
'''
def next_game_team(dict, team): #returns the date and oppenent of the next scheduled game. takes in team full name. #IGNORING TIMEZONES FOR NOW (time zones don't matter, compare it to local time in EST all the time, cuz thats where the API request is coming from)
    
    scheduleUrl = dict[team]['teamSchedule']

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    i = 1
    response = requests.get(scheduleUrl, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    while True:
        row = soup.find('tr', attrs={'data-idx': f'{i}'})
        if not row:
            break
        tableinfo = row.find_all('td', class_='Table__TD')
        time = tableinfo[2].text.strip()
        if time.find('-') != -1:
            i += 1
            continue
        url = soup.find('a', class_='AnchorLink Schedule__ticket')['href']
        year = extract_year(url)
        date = row.find('td', class_='Table__TD').text.strip()
        
        est = pytz.timezone('America/New_York')
        time_now = datetime.now(est).timestamp()
        date_time_str = f"{date} {time} {year}"
        gametime = est.localize(datetime.strptime(date_time_str, '%a, %b %d %I:%M %p %Y')).timestamp()
        if time_now < gametime:
            break
        i += 1
    
    if row:
        opponent = row.find('div', class_='flex items-center opponent-logo').find_all('span')[-1].text.strip()
        opponent_str = f"{opponent}"
    
    if date_time_str and opponent_str:
        return {'date': date_time_str, 'oppenent': opponent_str}
    else:
        return "There are no more games this season"



def game_history_five(dict, team): #current win-lost record and outputs history of last 5 games history, with time in EST. #i wouldnt try and call this function on a page without games
    scheduleUrl = dict[team]['teamSchedule']
    

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    game_history = []
    i = 1
    response = requests.get(scheduleUrl, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    while True:
        row = soup.find('tr', attrs={'data-idx': f'{i}'})
        if not row:
            break
        date = row.find('td', class_='Table__TD').text.strip()
        time = row.find_all('td', class_='Table__TD')[2].text.strip()
        if time.find('-') != -1:
            i += 1
            continue
        url = soup.find('a', class_='AnchorLink Schedule__ticket')['href']
        year = extract_year(url)
        est = pytz.timezone('America/New_York')
        time_now = datetime.now(est).timestamp()
        date_time_str = f"{date} {time} {year}"
        gametime = est.localize(datetime.strptime(date_time_str, '%a, %b %d %I:%M %p %Y')).timestamp()
        if time_now < gametime:
            break
        i += 1
    if not row and i != 1:
        newrow = soup.find('tr', attrs = {'data-idx': f'{i - 1}'})
        tableinfo = newrow.find_all('td', class_='Table__TD')
        W_L_record = tableinfo[3].text.strip()
        game_history.append({'record': W_L_record})
        k = 1
        while i > k:
            result = f"{tableinfo[2].text.strip()}"
            oppenent = f"{newrow.find('div', class_='flex items-center opponent-logo').find_all('span')[-1].text.strip()}"
            date = f"{tableinfo[0].text.strip()}"
            game_history.append({'oppenent': oppenent, 'game result': result, 'date': date})
            if k == 5: 
                break
            k += 1
            newrow = soup.find('tr', attrs={'data-idx': f'{i - k}'})
            tableinfo = newrow.find_all('td', class_='Table__TD')
    if not game_history: #maybe return the record from last season?
        return "There are no played games this season." 
    return game_history



data = get_mlb_scores() #this is all mlb data
dict = get_mlb_team_data(data) #gives us a dictionary request of all mlb data

teamLeaderList = get_team_leaders_dict(dict, "Chicago Cubs") #example team with Washington Nationals, gives us standing of this team and best player info.

allTeamLeaders = get_team_leaders(teamLeaderList[0]) #Tuple: name, position, headshot  #add this info on the team page.

#on team page add best player info, team standing, use ai to teach about history of team.

#there are no standings for the current season, could add that later.
#print(allTeamLeaders)


print(game_history_five(dict, "Chicago Cubs"))
