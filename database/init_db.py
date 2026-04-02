import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "parking.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS parking_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('available', 'booked')) DEFAULT 'available',
    vehicle_number TEXT,
    user_id TEXT,
    price REAL DEFAULT 0,
    address TEXT DEFAULT '',
    tags TEXT DEFAULT '',
    img TEXT DEFAULT '',
    rating REAL DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    is_best INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slot_id INTEGER NOT NULL,
    vehicle_number TEXT NOT NULL,
    user_id INTEGER,
    booked_at TEXT DEFAULT (datetime('now')),
    released_at TEXT,
    amount REAL DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('active', 'released')) DEFAULT 'active',
    FOREIGN KEY(slot_id) REFERENCES parking_slots(id)
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    firstname TEXT DEFAULT '',
    lastname TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    firstname TEXT DEFAULT '',
    lastname TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    role TEXT DEFAULT 'admin',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    plate TEXT UNIQUE NOT NULL,
    is_default INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_wallets (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    balance REAL DEFAULT 0.0,
    last_topup REAL DEFAULT 0.0,
    auto_topup INTEGER DEFAULT 1,
    topup_threshold REAL DEFAULT 100.0,
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_data TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT
);

"""

CHENNAI_SPOTS = [
    {
        'title': 'GCC Multilevel Parking',
        'price': 200,
        'address': 'Pondy Bazaar, T. Nagar',
        'tags': ['EV', 'Automated'],
        'img': 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200',
        'rating': 4.8,
        'reviews': 1240,
        'isBest': 1,
    },
    {
        'title': 'Express Avenue Mall',
        'price': 400,
        'address': 'Royapettah',
        'tags': ['Valet', 'Covered'],
        'img': 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200',
        'rating': 4.5,
        'reviews': 3100,
        'isBest': 0,
    },
    {
        'title': 'Spencer Plaza Lot',
        'price': 300,
        'address': 'Anna Salai',
        'tags': ['24/7'],
        'img': 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=200',
        'rating': 3.9,
        'reviews': 850,
        'isBest': 0,
    },
    {
        'title': 'Chennai Central CMRL',
        'price': 250,
        'address': 'Park Town',
        'tags': ['Metro', 'Security'],
        'img': 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200',
        'rating': 4.2,
        'reviews': 520,
        'isBest': 0,
    },
    {
        'title': 'VR Chennai Parking',
        'price': 400,
        'address': 'Anna Nagar West',
        'tags': ['Luxury', 'EV'],
        'img': 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200',
        'rating': 4.7,
        'reviews': 2100,
        'isBest': 1,
    },
    {
        'title': 'Tower Park Public Lot',
        'price': 200,
        'address': 'Anna Nagar',
        'tags': ['Open'],
        'img': 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=200',
        'rating': 4.1,
        'reviews': 430,
        'isBest': 0,
    },
    {
        'title': 'Phoenix Marketcity',
        'price': 400,
        'address': 'Velachery Main Rd',
        'tags': ['Valet', 'Covered'],
        'img': 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200',
        'rating': 4.6,
        'reviews': 4500,
        'isBest': 1,
    },
    {
        'title': 'Grand Square Mall',
        'price': 200,
        'address': 'Velachery-Tambaram Rd',
        'tags': ['Budget'],
        'img': 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200',
        'rating': 4.3,
        'reviews': 890,
        'isBest': 0,
    },
    {
        'title': 'Besant Nagar Beach Lot',
        'price': 200,
        'address': "Elliot's Beach",
        'tags': ['Open'],
        'img': 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=200',
        'rating': 4.0,
        'reviews': 2100,
        'isBest': 0,
    },
    {
        'title': 'Marina Mall OMR',
        'price': 300,
        'address': 'Egattur',
        'tags': ['CCTV'],
        'img': 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200',
        'rating': 4.4,
        'reviews': 1200,
        'isBest': 0,
    },
    {
        'title': 'Tidel Park Parking',
        'price': 300,
        'address': 'Tharamani',
        'tags': ['Corporate'],
        'img': 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=200',
        'rating': 4.1,
        'reviews': 670,
        'isBest': 0,
    },
]


def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("PRAGMA foreign_keys=ON")
        conn.executescript(SCHEMA)

        # Add missing metadata columns for older schemas
        def _add_column_if_missing(table, column_name, definition):
            try:
                conn.execute(f"ALTER TABLE {table} ADD COLUMN {column_name} {definition}")
            except sqlite3.OperationalError:
                pass

        _add_column_if_missing('parking_slots', 'price', 'REAL DEFAULT 0')
        _add_column_if_missing('parking_slots', 'address', "TEXT DEFAULT ''")
        _add_column_if_missing('parking_slots', 'tags', "TEXT DEFAULT ''")
        _add_column_if_missing('parking_slots', 'img', "TEXT DEFAULT ''")
        _add_column_if_missing('parking_slots', 'rating', 'REAL DEFAULT 0')
        _add_column_if_missing('parking_slots', 'reviews', 'INTEGER DEFAULT 0')
        _add_column_if_missing('parking_slots', 'is_best', 'INTEGER DEFAULT 0')
        _add_column_if_missing('admins', 'role', "TEXT DEFAULT 'admin'")
        _add_column_if_missing('users', 'firstname', "TEXT DEFAULT ''")
        _add_column_if_missing('users', 'lastname', "TEXT DEFAULT ''")
        _add_column_if_missing('users', 'phone', "TEXT DEFAULT ''")
        _add_column_if_missing('users', 'is_verified', 'INTEGER DEFAULT 0')
        _add_column_if_missing('users', 'otp', "TEXT")
        _add_column_if_missing('users', 'otp_expires', "TEXT")
        # Migration: Drop 'name' column from users/admins
        try:
            conn.executescript('''
                CREATE TABLE users_new AS SELECT id, email, password, firstname, lastname, phone, created_at FROM users;
                DROP TABLE users;
                ALTER TABLE users_new RENAME TO users;
                CREATE TABLE admins_new AS SELECT id, email, password, firstname, lastname, phone, role, created_at FROM admins;
                DROP TABLE admins;
                ALTER TABLE admins_new RENAME TO admins;
            ''')
        except Exception as e:
            print(f"Migration skipped (already done or error): {e}")

        rows = conn.execute("SELECT id, name FROM parking_slots").fetchall()
        should_seed = False

        if not rows:
            should_seed = True
        elif all(str(row[1]).startswith('Slot-') for row in rows):
            should_seed = True

        if should_seed:
            conn.execute("DELETE FROM parking_slots")
            for spot in CHENNAI_SPOTS:
                conn.execute(
                    "INSERT INTO parking_slots (name, status, price, address, tags, img, rating, reviews, is_best) VALUES (?, 'available', ?, ?, ?, ?, ?, ?, ?)",
                    (
                        spot['title'],
                        spot.get('price', 0),
                        spot.get('address', ''),
                        ','.join(spot.get('tags', [])),
                        spot.get('img', ''),
                        spot.get('rating', 0),
                        spot.get('reviews', 0),
                        int(bool(spot.get('isBest', 0))),
                    ),
                )
            print(f"Seeded {len(CHENNAI_SPOTS)} Chennai spots into parking_slots")
        else:
            print(f"parking_slots contains {len(rows)} records, skipping seed")

        # Seed default admin user
        cursor = conn.execute("SELECT COUNT(1) FROM admins")
        if cursor.fetchone()[0] == 0:
            conn.execute(
                "INSERT INTO admins (email, password, firstname, lastname, role) VALUES (?, ?, 'Admin', '', ?)",
                ('admin@parking.com', 'admin123', 'admin'),
            )
            print('Seeded default admin user admin@parking.com (password admin123)')

    print(f"Database initialized at: {DB_PATH}")


if __name__ == "__main__":
    init_db()
