import sqlite3

def create_database():
    connection = sqlite3.connect("mobilemoney.db")
    cursor = connection.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tx_type TEXT,
        amount INTEGER,
        name TEXT,
        datetime TEXT,
        body TEXT
    );
    """)

    connection.commit()
    connection.close()
    print("Database 'n tablecreated: mobilemoney.db")

if __name__ == "__main__":
    create_database()

#sqlite3
