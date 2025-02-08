import duckdb
import pandas as pd
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

def get_table_constraints(conn, table_name):
    """
    Extract constraints from DuckDB table using DuckDB's specific schema queries
    """
    # Get primary key and unique constraints from table info
    constraint_query = f"""
    SELECT 
        column_name,
        CASE WHEN is_nullable = 'NO' THEN true ELSE false END as not_null,
        CASE WHEN is_generated = 'ALWAYS' THEN true ELSE false END as is_generated
    FROM information_schema.columns 
    WHERE table_name = '{table_name}'
    """
    
    constraints = {
        'columns': conn.execute(constraint_query).fetchall()
    }
    
    # Get index information
    try:
        index_query = f"PRAGMA table_info('{table_name}')"
        index_info = conn.execute(index_query).fetchall()
        
        # Extract primary key columns from pragma info
        pk_columns = [col[1] for col in index_info if col[5] > 0]  # col[5] is pk flag
        constraints['primary_keys'] = pk_columns
        
    except Exception as e:
        print(f"Warning: Could not get index information for {table_name}: {e}")
        constraints['primary_keys'] = []
    
    return constraints

def extract_tables_from_duckdb(db_path):
    """
    Extract all tables and their constraints from DuckDB database and save as CSV files
    """
    conn = duckdb.connect(db_path)
    
    # Get list of all tables
    tables = conn.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='main'").fetchall()
    
    if not os.path.exists('exports'):
        os.makedirs('exports')
    
    exported_files = []
    table_metadata = {}
    
    for table in tables:
        table_name = table[0]
        print(f"Exporting table: {table_name}")
        
        # Get table schema including column types
        schema_query = f"""
        SELECT 
            column_name,
            data_type,
            CASE WHEN is_nullable = 'NO' THEN false ELSE true END as is_nullable
        FROM information_schema.columns 
        WHERE table_name = '{table_name}'
        ORDER BY ordinal_position
        """
        schema = conn.execute(schema_query).fetchall()
        
        # Get constraints
        constraints = get_table_constraints(conn, table_name)
        
        # Store metadata
        table_metadata[table_name] = {
            'schema': schema,
            'constraints': constraints
        }
        
        # Export data to CSV
        df = conn.execute(f"SELECT * FROM {table_name}").df()
        csv_path = f"exports/{table_name}.csv"
        df.to_csv(csv_path, index=False)
        exported_files.append((table_name, csv_path))
        
        print(f"Exported {len(df)} rows to {csv_path}")
    
    conn.close()
    return exported_files, table_metadata

def create_postgres_tables(connection_string, table_metadata):
    """
    Create tables in PostgreSQL with constraints
    """
    engine = create_engine(connection_string)
    
    type_mapping = {
        'BOOLEAN': 'BOOLEAN',
        'TINYINT': 'SMALLINT',
        'SMALLINT': 'SMALLINT',
        'INTEGER': 'INTEGER',
        'BIGINT': 'BIGINT',
        'DECIMAL': 'DECIMAL',
        'REAL': 'REAL',
        'DOUBLE': 'DOUBLE PRECISION',
        'VARCHAR': 'VARCHAR',
        'TEXT': 'TEXT',
        'DATE': 'DATE',
        'TIME': 'TIME',
        'TIMESTAMP': 'TIMESTAMP',
        'BLOB': 'BYTEA'
    }
    
    with engine.connect() as conn:
        for table_name, metadata in table_metadata.items():
            columns = []
            
            # Add column definitions with constraints
            for col in metadata['schema']:
                col_name = col[0]
                col_type = col[1].upper()
                is_nullable = col[2]
                
                pg_type = type_mapping.get(col_type, 'TEXT')
                null_constraint = '' if is_nullable else 'NOT NULL'
                
                columns.append(f"{col_name} {pg_type} {null_constraint}".strip())
            
            # Add primary key constraint if exists
            if metadata['constraints']['primary_keys']:
                pk_columns = ', '.join(metadata['constraints']['primary_keys'])
                columns.append(f"PRIMARY KEY ({pk_columns})")
            
            create_table_sql = f"""
            CREATE TABLE IF NOT EXISTS {table_name} (
                {', '.join(columns)}
            );
            """
            conn.execute(text(create_table_sql))
            print(f"Created table: {table_name}")

def import_csv_to_postgres(connection_string, exported_files):
    """
    Import CSV files into PostgreSQL
    """
    engine = create_engine(connection_string)
    
    for table_name, csv_path in exported_files:
        print(f"Importing {csv_path} into {table_name}")
        
        # Read CSV in chunks to handle large files
        for chunk in pd.read_csv(csv_path, chunksize=10000):
            chunk.to_sql(table_name, engine, if_exists='append', index=False)
        
        print(f"Imported {csv_path}")

def main():
    # Load environment variables
    load_dotenv()
    
    # Configuration
    duckdb_path = "database.db"  # Update this to your DuckDB file path
    postgres_connection_string = os.getenv('DIRECT_URL')
    
    if not postgres_connection_string:
        raise ValueError("DB_CONN environment variable not found")
    
    # Extract data and metadata from DuckDB
    exported_files, table_metadata = extract_tables_from_duckdb(duckdb_path)
    
    # Create tables with constraints in PostgreSQL
    create_postgres_tables(postgres_connection_string, table_metadata)
    
    # Import data into PostgreSQL
    import_csv_to_postgres(postgres_connection_string, exported_files)
    
    # Clean up CSV files
    for _, csv_path in exported_files:
        os.remove(csv_path)
    os.rmdir('exports')
    
    print("Migration completed successfully!")

if __name__ == "__main__":
    main()