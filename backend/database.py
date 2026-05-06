import os

import psycopg2
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the connection string from the environment variable
conn_string = os.getenv("DATABASE_URL")
conn = None

try:
    conn = psycopg2.connect(conn_string)
    print("Connection established")

    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS notes (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                tags TEXT[] DEFAULT '{}',
                updatedAt TIMESTAMP DEFAULT NOW(),
                wordCount INT DEFAULT 0
            );
        """)
        cur.execute("SELECT setval('notes_id_seq', COALESCE((SELECT MAX(id) FROM notes), 0) + 1, false);")
        conn.commit()
        print("Finished creating table.")

except Exception as e:
    print("Connection failed.")
    print(e)