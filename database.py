import sqlite3

def create_database():
    conn = sqlite3.connect("smartbiz.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sales(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product TEXT,
        quantity INTEGER,
        price REAL
    )
    """)

    conn.commit()
    conn.close()

    print("Database Created Successfully!")

if __name__ == "__main__":
    create_database()