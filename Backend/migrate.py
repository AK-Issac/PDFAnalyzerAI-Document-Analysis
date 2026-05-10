import psycopg2
import os

DB_URL = os.environ.get("DATABASE_URL", "postgresql://admin:adminpassword@localhost:5432/legalai_db")

def migrate():
    print("Connecting to database...")
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = True
    cursor = conn.cursor()

    print("Adding 'tier' column to 'users' table if it doesn't exist...")
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN tier VARCHAR(50) DEFAULT 'free';")
        print("Success: 'tier' column added.")
    except psycopg2.errors.DuplicateColumn:
        print("'tier' column already exists.")
    
    print("Creating 'usage_logs' table if it doesn't exist...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usage_logs (
            id VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
            action_type VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    print("Success: 'usage_logs' table is ready.")

    print("Adding 'stripe_customer_id' column to 'users' table if it doesn't exist...")
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255) UNIQUE;")
        print("Success: 'stripe_customer_id' column added.")
    except psycopg2.errors.DuplicateColumn:
        print("'stripe_customer_id' column already exists.")

    print("Migration complete!")
    cursor.close()
    conn.close()

if __name__ == "__main__":
    migrate()
