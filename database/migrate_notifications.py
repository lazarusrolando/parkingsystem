import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import backend.db as db

def migrate_notifications():
    """Add notifications column to users and admins tables"""
    conn = db._get_conn()
    
    # Users table
    cursor = conn.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in cursor.fetchall()]
    if 'notifications' not in columns:
        conn.execute('ALTER TABLE users ADD COLUMN notifications TEXT DEFAULT \'{"push":true,"email":false,"sms":true}\'')
        print("Added notifications column to users table")
    
    # Admins table
    cursor = conn.execute("PRAGMA table_info(admins)")
    columns = [row[1] for row in cursor.fetchall()]
    if 'notifications' not in columns:
        conn.execute('ALTER TABLE admins ADD COLUMN notifications TEXT DEFAULT \'{"push":true,"email":false,"sms":true}\'')
        print("Added notifications column to admins table")
    
    conn.commit()
    print("Migration complete!")
    conn.close()

if __name__ == '__main__':
    migrate_notifications()

