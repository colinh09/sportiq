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
    if isinstance(obj, str):
        return obj.replace("\\", "")
    elif isinstance(obj, list):
        return [remove_backslashes(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: remove_backslashes(value) for key, value in obj.items()}
    else:
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
        rosterUrl = f"https://www.espn.com/mlb/team/roster/_/name/{abi}"
        year = datetime.now().year
        teamSchedule = f"https://www.espn.com/mlb/team/schedule/_/name/{abi}/season/{year}" #doing this as a test for my next function for last 5 game history
        lastYearSchedule = f"https://www.espn.com/mlb/team/schedule/_/name/{abi}/season/{year - 1}/seasontype/2/half/2"
        teamLogo = f"https://a.espncdn.com/i/teamlogos/mlb/500/scoreboard/{abi}.png" #abritatry link for logo
        retDict[find['displayName']] = {'Logo': teamLogo, 'teamAbbreviation': abi, 'teamUrl': teamUrl, 'teamSchedule': teamSchedule, 'rosterUrl': rosterUrl, 'lastYearSchedule': lastYearSchedule, 'displayName': find['displayName']}
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
    newAthletes = set()
    newAthleteInfo = []
    for athlete in list:
        newAddition = athlete['athlete']['name']
        newHeadshot = athlete['athlete']['headshot']
        newPosition = athlete['athlete']['position']
        if newAddition not in newAthletes:
            newAthletes.add(newAddition)
            newAthleteInfo.append((newAddition, newPosition, newHeadshot))
    return newAthleteInfo

def get_all_players(mlb_data_dict, team): #return a dictionary of list, similar to above, except the key is either Pitchers, Catchers, Infielders, or Outfielders
    url = mlb_data_dict[team]['rosterUrl']

    players_dict = {}

    # Send GET request and get the page content
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    response = requests.get(url, headers=headers)
    
    # Parse the HTML content
    
    roster_soup = BeautifulSoup(response.content, 'html.parser')

    positions_tables = roster_soup.find_all('div', class_='ResponsiveTable')

    group = None
    for table in positions_tables:
        
        group = table.find('div', class_='Table__Title') #Pitchers, Catchers, Infielders, or Outfielders
        if not group:
            continue
        player_rows = roster_soup.find_all('tr', class_='Table__TR')
        
        for table in player_rows:
            name = None
            position = None
            headshot = None
            
            line = table.find('div')
            
            position_line = table.find_all('td')
           
            if position_line:
                position = position_line[2].find('div').text
            if line:
                parsed = line.find('div').find('figure').find('div', class_="Image__Wrapper aspect-ratio--child")
                headshot = parsed.find('img')['alt']
                name = parsed.find('img')['title']

            if not name:
                continue
            player_info = (name, position, headshot)
            if group.text not in players_dict:
                players_dict[group.text] = [player_info]
            else:
                players_dict[group.text].append(player_info)
    return players_dict #similar return as function above, but it is a dictionary, telling us if they are a pitcher, infielder, outfielder or catcher

'''

CANT PROMISE THAT THESE TWO FUNCTIONS WORK AS INTENDED, WE DONT KNOW WHAT THE PAGE LOOKS LIKE WHEN THE SEASON STARTS. This is a draft version of these two functions and can be edited later.
'''
def extract_year(url): #say we are in december, the next game is in febuary. Thus cannot take the current year.
    year_match = re.search(r'(\d{4})', url)
    return year_match.group(1) if year_match else None
def next_game_team(dict, team): #returns the date and opponent of the next scheduled game. takes in team full name. #IGNORING TIMEZONES FOR NOW (time zones don't matter, compare it to local time in EST all the time, cuz thats where the API request is coming from)
    
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
        
        year = extract_year(repr(soup.find('title')))
        
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
        return {'date': date_time_str, 'opponent': opponent_str}
    else:
        return "There are no more games this season"



def game_history_five(dict, team, scheduleUrl): #current win-lost record and outputs history of last 5 games history, with time in EST. If none for this season, gets last season and puts a user message before information stated.
    
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
        part = row.find_all('td', class_='Table__TD')
        if len(part) < 3:
            break
        time = part[2].text.strip()
        if time.find('-') != -1 or date.find('Postponed'):
            i += 1
            continue
        year = extract_year(repr(soup.find('title')))
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
            if not newrow:
                continue
            partition = newrow.find('div', class_='flex items-center opponent-logo')
            if not partition:
                k += 1
                newrow = soup.find('tr', attrs={'data-idx': f'{i - k}'})
                continue
            print()
            opponent_url = partition.find_all('span')[-1].find('a', class_='AnchorLink')['href']
            
            opponent = opponent_url[opponent_url.rfind('/') + 1:].replace('-', ' ').title()
            date = f"{tableinfo[0].text.strip()}"
            game_history.append({'opponent': opponent, 'game result': result, 'date': date})
            if k == 5: 
                break
            k += 1
            newrow = soup.find('tr', attrs={'data-idx': f'{i - k}'})
            tableinfo = newrow.find_all('td', class_='Table__TD')
    if not game_history: #maybe return the record from last season?
        #print("There are no played games this season, pulling up last season history (appending this message to beginning of new_history list)")
        game_history = game_history_five(dict, team, dict[team]['lastYearSchedule'])
        game_history.insert(0, {'user_message': "There are no played games this season, pulling up last season history"})
    return game_history

def return_team_list():
    data = get_mlb_scores()
    data_dict = get_mlb_team_data(data)
    for key in data_dict.keys():
        data_dict[key]['displayName'] = key
    team_data_list = [value for value in data_dict.values()]
    return team_data_list

LISTINGS = ['Pitchers', 'Catchers', 'Infielders']
def get_all_players_list(MLBdata):
    allTeamNames = map(lambda team: team['displayName'], return_team_list())
    allPlayers = []
    for teamName in allTeamNames:
        playerDict = get_all_players(MLBdata, teamName)
        for listing in LISTINGS:
            curPlayerList = playerDict[listing]
            curPlayerList = map(lambda curPlayer: curPlayer + (teamName, [listing],), curPlayerList)
            for curPlayer in curPlayerList:
                if curPlayer in allPlayers:
                    existingListings = allPlayers[curPlayer][4]
                    curPlayer = curPlayer[:4] + (existingListings + curPlayer[4],)
                allPlayers.append(curPlayer)
    return allPlayers

data = get_mlb_scores() #this is all mlb data
mlb_dict = get_mlb_team_data(data) #gives us a dictionary request of all mlb data
team = 'Kansas City Royals'
print(game_history_five(mlb_dict, team, mlb_dict[team]['lastYearSchedule']))