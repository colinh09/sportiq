import os
from dotenv import load_dotenv
import psycopg2
from bs4 import BeautifulSoup
import requests
import json
import re

load_dotenv()

db_url = os.getenv('DIRECT_URL')

def remove_backslashes(obj):
    if isinstance(obj, str):
        return obj.replace("\\", "")
    elif isinstance(obj, list):
        return [remove_backslashes(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: remove_backslashes(value) for key, value in obj.items()}
    else:
        return obj

def get_team_leaders(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    script_tags = soup.find_all('script')
    
    for script in script_tags:
        for string in script.stripped_strings:
            d = repr(string)
            if 'teamLeaders' in d:
                first_idx = d.find('teamLeaders')
                team_leader_info = d[first_idx + 13:]
                second_idx = team_leader_info.find("dictionary")
                team_leader_info = team_leader_info[:second_idx - 2]
                team_leader_info = remove_backslashes(team_leader_info.strip())
                parsed_info = json.loads(team_leader_info)
                return [(leader['athlete']['name'], leader['athlete']['position']) 
                        for leader in parsed_info['leaders']]
    return []

def create_team_leaders_table():
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS team_leaders (
            team_id INTEGER REFERENCES "Teams"("teamId"),
            player_id INTEGER REFERENCES "Players"("playerId"),
            PRIMARY KEY (team_id, player_id)
        );
    """)
    
    conn.commit()
    return conn, cur

def populate_team_leaders():
    conn, cur = create_team_leaders_table()
    
    cur.execute('SELECT "teamId", "displayName", "teamAbbreviation" FROM "Teams"')
    teams = cur.fetchall()
    
    for team_id, team_name, abbr in teams:
        team_url = f"https://www.espn.com/mlb/team/stats/_/name/{abbr}"
        leaders = get_team_leaders(team_url)
        
        for player_name, position in leaders:
            cur.execute("""
                SELECT "playerId" FROM "Players" 
                WHERE name = %s AND "teamId" = %s
                LIMIT 1
            """, (player_name, team_id))
            
            player_result = cur.fetchone()
            if player_result:
                player_id = player_result[0]
                cur.execute("""
                    INSERT INTO team_leaders (team_id, player_id)
                    VALUES (%s, %s)
                    ON CONFLICT (team_id, player_id) DO NOTHING
                """, (team_id, player_id))
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    populate_team_leaders()