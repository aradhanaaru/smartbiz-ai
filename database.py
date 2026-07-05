import os
import psycopg2

DATABASE_URL = os.environ.get("DATABASE_URL")

def create_database():
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is not set.")
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sales(
        id SERIAL PRIMARY KEY,
        product TEXT,
        quantity INTEGER,
        price REAL
    )
    """)
    conn.commit()
    conn.close()
    print("Database created successfully (on Supabase)!")

if __name__ == "__main__":
    create_database()