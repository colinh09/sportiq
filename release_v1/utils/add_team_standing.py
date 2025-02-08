import os
from dotenv import load_dotenv
import psycopg2
from bs4 import BeautifulSoup
import requests

load_dotenv()

db_url = os.getenv('DIRECT_URL')

def get_team_standing(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    standing_tags = soup.find_all('li')
    for tag in standing_tags:
        for string in tag.stripped_strings:
            text = repr(string)
            if 'NL ' in text or 'AL ' in text:
                # Remove quotes and escape characters from the string
                return text.strip("'")
    return None

def add_standings_column():
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Add standings column if it doesn't exist
    cur.execute("""
        DO $$ 
        BEGIN 
            IF NOT EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_name = 'Teams' 
                AND column_name = 'standing'
            ) THEN 
                ALTER TABLE "Teams" 
                ADD COLUMN standing TEXT;
            END IF;
        END $$;
    """)
    
    conn.commit()
    return conn, cur

def update_team_standings():
    conn, cur = add_standings_column()
    
    try:
        # Get all teams
        cur.execute('SELECT "teamId", "teamAbbreviation" FROM "Teams"')
        teams = cur.fetchall()
        
        for team_id, abbr in teams:
            team_url = f"https://www.espn.com/mlb/team/stats/_/name/{abbr}"
            standing = get_team_standing(team_url)
            
            if standing:
                cur.execute("""
                    UPDATE "Teams"
                    SET standing = %s
                    WHERE "teamId" = %s
                """, (standing, team_id))
        
        conn.commit()
        print("Team standings updated successfully")
        
    except Exception as e:
        print(f"Error updating standings: {e}")
        conn.rollback()
    
    finally:
        conn.close()

if __name__ == "__main__":
    update_team_standings()