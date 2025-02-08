import duckdb
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

def get_unique_player_positions(duck_conn):
    """Get unique player-position combinations from DuckDB"""
    query = """
    SELECT DISTINCT name, position
    FROM Players
    ORDER BY name, position
    """
    return duck_conn.execute(query).fetchall()

def get_player_id_mapping(pg_conn):
    """Get mapping of player names to playerIds"""
    query = text('SELECT "playerId", name FROM "Players"')
    result = pg_conn.execute(query)
    return {row.name: row.playerId for row in result}

def main():
    # Load environment variables
    load_dotenv()
    
    postgres_url = os.getenv('DIRECT_URL')
    if not postgres_url:
        raise ValueError("DIRECT_URL environment variable not found")
    
    # Initialize connections
    duck_conn = duckdb.connect("database.db")  # Update path as needed
    pg_engine = create_engine(postgres_url)
    
    try:
        # Get data from DuckDB
        player_positions = get_unique_player_positions(duck_conn)
        print(f"Found {len(player_positions)} unique player-position combinations")
        
        with pg_engine.connect() as pg_conn:
            # Get player ID mapping
            player_mapping = get_player_id_mapping(pg_conn)
            
            # Prepare entries for insertion
            entries = []
            skipped = 0
            for name, position_code in player_positions:
                # Skip if we can't find the player
                if name not in player_mapping:
                    print(f"Warning: Could not find playerId for {name}")
                    skipped += 1
                    continue
                
                entries.append({
                    "playerId": player_mapping[name],
                    "position_code": position_code
                })
            
            # Insert in batches of 100
            batch_size = 100
            inserted = 0
            for i in range(0, len(entries), batch_size):
                batch = entries[i:i + batch_size]
                insert_query = text("""
                    INSERT INTO "PlayerPositions" ("playerId", "position_code")
                    VALUES (:playerId, :position_code)
                    ON CONFLICT ("playerId", "position_code") DO NOTHING
                """)
                result = pg_conn.execute(insert_query, batch)
                inserted += result.rowcount
                pg_conn.commit()
                print(f"Inserted batch {i//batch_size + 1}")
            
            print(f"\nResults:")
            print(f"Total entries found: {len(player_positions)}")
            print(f"Entries skipped: {skipped}")
            print(f"Entries inserted: {inserted}")
            
    finally:
        duck_conn.close()

if __name__ == "__main__":
    main()