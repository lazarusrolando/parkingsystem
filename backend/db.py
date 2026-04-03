import sqlite3
import os
from pathlib import Path
from datetime import datetime, timedelta
import json

DB_FILE = os.environ.get('PARKING_DB', str(Path(__file__).resolve().parent.parent / 'database' / 'parking.db'))

def _get_conn():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys = ON')
    return conn

def get_slots():
    with _get_conn() as c:
        rows = c.execute('SELECT * FROM parking_slots ORDER BY id').fetchall()
        return [dict(row) for row in rows]

def get_slot(slot_id):
    with _get_conn() as c:
        row = c.execute('SELECT * FROM parking_slots WHERE id=?', (slot_id,)).fetchone()
        return dict(row) if row else None

def get_bookings(active_only=True):
    with _get_conn() as c:
        if active_only:
            rows = c.execute('SELECT * FROM bookings WHERE status="active" ORDER BY booked_at DESC').fetchall()
        else:
            rows = c.execute('SELECT * FROM bookings ORDER BY booked_at DESC').fetchall()
        return [dict(row) for row in rows]

def get_bookings_by_status(status):
    with _get_conn() as c:
        rows = c.execute('SELECT * FROM bookings WHERE status=? ORDER BY booked_at DESC', (status,)).fetchall()
        return [dict(row) for row in rows]

def get_slots_by_status(status):
    with _get_conn() as c:
        rows = c.execute('SELECT * FROM parking_slots WHERE status=? ORDER BY id', (status,)).fetchall()
        return [dict(row) for row in rows]

def update_slot(slot_id, name=None, status=None):
    with _get_conn() as c:
        slot = get_slot(slot_id)
        if not slot:
            raise ValueError('slot not found')

        updates = []
        params = []

        if name is not None:
            updates.append('name=?')
            params.append(name)

        if status is not None:
            if status not in ('available', 'booked'):
                raise ValueError('status must be available or booked')
            updates.append('status=?')
            params.append(status)

        updates.append('updated_at=datetime("now")')

        if not updates:
            return slot

        query = f"UPDATE parking_slots SET {', '.join(updates)} WHERE id=?"
        params.append(slot_id)
        c.execute(query, tuple(params))
        return get_slot(slot_id)

def book_slot(slot_id, amount=0.0):
    with _get_conn() as c:
        slot = get_slot(slot_id)
        if not slot:
            raise ValueError('slot not found')
        if slot['status'] == 'booked':
            raise ValueError('slot already booked')

        c.execute(
            'UPDATE parking_slots SET status=?, updated_at=datetime("now") WHERE id=?',
            ('booked', slot_id),
        )
        c.execute(
            'INSERT INTO bookings (slot_id, amount, status) VALUES (?, ?, "active")',
            (slot_id, float(amount)),
        )
        return get_slot(slot_id)

def release_slot(slot_id):
    with _get_conn() as c:
        slot = get_slot(slot_id)
        if not slot:
            raise ValueError('slot not found')
        if slot['status'] != 'booked':
            raise ValueError('slot is not booked')

        c.execute(
            'UPDATE parking_slots SET status=?, vehicle_number=NULL, user_id=NULL, updated_at=datetime("now") WHERE id=?',
            ('available', slot_id),
        )
        c.execute(
            'UPDATE bookings SET released_at=datetime("now"), status="released" WHERE slot_id=? AND status="active"',
            (slot_id,),
        )
        return get_slot(slot_id)

def cancel_booking(booking_id):
    with _get_conn() as c:
        row = c.execute('SELECT * FROM bookings WHERE id=? AND status="active"', (booking_id,)).fetchone()
        if not row:
            raise ValueError('active booking not found')

        slot_id = row['slot_id']
        db_slot = get_slot(slot_id)
        if db_slot and db_slot['status'] == 'booked':
            c.execute(
                'UPDATE parking_slots SET status=?, vehicle_number=NULL, user_id=NULL, updated_at=datetime("now") WHERE id=?',
                ('available', slot_id),
            )

        c.execute(
            'UPDATE bookings SET status="released", released_at=datetime("now") WHERE id=?',
            (booking_id,),
        )

        return get_slot(slot_id)

def create_user(email, password, firstname=None, lastname=None, phone=None):
    with _get_conn() as c:
        c.execute(
            'INSERT INTO users (email, password, firstname, lastname, phone, created_at) VALUES (?, ?, ?, ?, ?, datetime(\"now\"))',
            (email, password, firstname or '', lastname or '', phone or ''),
        )
        c.execute('COMMIT')
        return get_user_by_email(email)

def get_admin_by_email(email):
    with _get_conn() as c:
        row = c.execute('SELECT *, (firstname || " " || lastname) as name FROM admins WHERE email=?', (email,)).fetchone()
        if row:
            row = dict(row)
            row['name'] = row['name'].strip()
            if row['name'] == ' ':
                row['name'] = ''
        return row

def verify_admin(email, password):
    admin = get_admin_by_email(email)
    if admin and admin.get('password') == password:
        return admin
    return None

def create_admin(email, password, firstname=None, lastname=None, phone=None, role='admin'):
    with _get_conn() as c:
        c.execute(
            'INSERT INTO admins (email, password, firstname, lastname, phone, role, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime(\"now\"))',
            (email, password, firstname or '', lastname or '', phone or '', role),
        )
        c.execute('COMMIT')
        return get_admin_by_email(email)

def get_user_by_email(email):
    with _get_conn() as c:
        row = c.execute('SELECT id, email, password, firstname, lastname, phone, created_at, (firstname || " " || lastname) as name FROM users WHERE email=?', (email,)).fetchone()
        if row:
            row = dict(row)
            row['name'] = row['name'].strip()
            if row['name'] == ' ':
                row['name'] = ''
        return row

def verify_user(email, password):
    user = get_user_by_email(email)
    if user and user.get('password') == password:
        return user
    return None

def get_all_users():
    with _get_conn() as c:
        rows = c.execute('SELECT id, email, firstname, lastname, phone, created_at, (firstname || " " || lastname) as name FROM users ORDER BY created_at DESC').fetchall()
        return [dict(row) for row in rows]

def get_all_admins():
    with _get_conn() as c:
        rows = c.execute('SELECT id, email, firstname, lastname, phone, role, created_at, (firstname || " " || lastname) as name FROM admins ORDER BY created_at DESC').fetchall()
        return [dict(row) for row in rows]

def get_user_vehicles(user_id):
    with _get_conn() as c:
        rows = c.execute('SELECT * FROM user_vehicles WHERE user_id=? ORDER BY is_default DESC, id', (user_id,)).fetchall()
        return [dict(row) for row in rows]

def add_user_vehicle(user_id, name, plate):
    with _get_conn() as c:
        c.execute('INSERT INTO user_vehicles (user_id, name, plate) VALUES (?, ?, ?)', (user_id, name, plate))
        return get_user_vehicles(user_id)[-1]

def set_default_vehicle(vehicle_id):
    with _get_conn() as c:
        c.execute('UPDATE user_vehicles SET is_default=0')
        c.execute('UPDATE user_vehicles SET is_default=1 WHERE id=?', (vehicle_id,))
        return True

def get_user_wallet(user_id):
    with _get_conn() as c:
        row = c.execute('SELECT * FROM user_wallets WHERE user_id=?', (user_id,)).fetchone()
        return dict(row) if row else None

def update_user_wallet(user_id, delta, last_topup=0, auto_topup=1, threshold=100):
    with _get_conn() as c:
        row = c.execute('SELECT 1 FROM user_wallets WHERE user_id=?', (user_id,)).fetchone()
        if row:
            c.execute('''
                UPDATE user_wallets SET balance=balance + ?, last_topup=?, auto_topup=?, topup_threshold=?, updated_at=datetime('now')
                WHERE user_id=?
            ''', (delta, last_topup, auto_topup, threshold, user_id))
        else:
            c.execute('''
                INSERT INTO user_wallets (user_id, balance, last_topup, auto_topup, topup_threshold)
                VALUES (?, ?, ?, ?, ?)
            ''', (user_id, delta, last_topup, auto_topup, threshold))
        return get_user_wallet(user_id)

def get_user_bookings(user_id):
    with _get_conn() as c:
        rows = c.execute('''
            SELECT b.*, ps.name as slot_name FROM bookings b
            JOIN parking_slots ps ON b.slot_id = ps.id
            WHERE b.user_id=? OR b.user_id IS NULL
            ORDER BY b.booked_at DESC
        ''', (user_id,)).fetchall()
        return [dict(row) for row in rows]

def create_slot(name):
    with _get_conn() as c:
        cursor = c.execute('INSERT INTO parking_slots (name, status) VALUES (?, "available")', (name,))
        return get_slot(cursor.lastrowid)

def create_session(token, user):
    with _get_conn() as c:
        user_data = json.dumps(user)
        c.execute(
            'INSERT OR REPLACE INTO sessions (token, user_data) VALUES (?, ?)',
            (token, user_data)
        )
        return True

def get_session(token):
    with _get_conn() as c:
        row = c.execute('SELECT user_data FROM sessions WHERE token = ?', (token,)).fetchone()
        if row:
            return json.loads(row['user_data'])
        return None

def delete_session(token):
    with _get_conn() as c:
        c.execute('DELETE FROM sessions WHERE token = ?', (token,))
        return c.rowcount > 0

def get_admin_stats():
    with _get_conn() as c:
        total_slots = c.execute('SELECT COUNT(*) FROM parking_slots').fetchone()[0]
        available_slots = c.execute('SELECT COUNT(*) FROM parking_slots WHERE status=\"available\"').fetchone()[0]
        occupied_slots = total_slots - available_slots
        occupancy = total_slots > 0 and round((occupied_slots / total_slots) * 100, 1) or 0
        active_bookings = c.execute('SELECT COUNT(*) FROM bookings WHERE status=\"active\"').fetchone()[0]
        total_revenue = c.execute('SELECT COALESCE(SUM(amount), 0) FROM bookings WHERE status=\"released\"').fetchone()[0]
        new_registrations = c.execute('SELECT COUNT(*) FROM users WHERE date(created_at) >= date(\"now\", \"-7 days\")').fetchone()[0]
        return {
            'total_slots': total_slots,
            'occupied': occupied_slots,
            'available': available_slots,
            'occupancy': occupancy,
            'active_bookings': active_bookings,
            'total_revenue': round(total_revenue, 2),
            'new_registrations': new_registrations
        }

# --- Support Tickets ---

def init_support_tickets_table():
    """Initialize support_tickets table if it doesn't exist"""
    with _get_conn() as c:
        c.execute('''
            CREATE TABLE IF NOT EXISTS support_tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                ticket_id TEXT UNIQUE NOT NULL,
                category TEXT NOT NULL,
                priority TEXT NOT NULL DEFAULT 'Low',
                subject TEXT NOT NULL,
                description TEXT,
                status TEXT NOT NULL DEFAULT 'Open',
                created_at TEXT NOT NULL,
                updated_at TEXT,
                resolved_at TEXT,
                admin_reply TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')

# Initialize table on module load
init_support_tickets_table()

def create_support_ticket(user_id, category, priority, subject, description):
    """Create a new support ticket"""
    created_at = datetime.now().isoformat()
    
    with _get_conn() as c:
        # Generate ticket_id based on existing count
        count = c.execute('SELECT COUNT(*) FROM support_tickets').fetchone()[0]
        ticket_id = f"SPS-{10000 + count + 1}"
        
        cursor = c.execute('''
            INSERT INTO support_tickets (user_id, ticket_id, category, priority, subject, description, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'Open', ?)
        ''', (user_id, ticket_id, category, priority, subject, description, created_at))
        return {
            'id': cursor.lastrowid,
            'ticket_id': ticket_id,
            'user_id': user_id,
            'category': category,
            'priority': priority,
            'subject': subject,
            'description': description,
            'status': 'Open',
            'created_at': created_at
        }

def get_support_tickets_by_user(user_id):
    """Get all support tickets for a specific user"""
    with _get_conn() as c:
        rows = c.execute('''
            SELECT * FROM support_tickets 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        ''', (user_id,)).fetchall()
        return [dict(row) for row in rows]

def get_all_support_tickets():
    """Get all support tickets (admin)"""
    with _get_conn() as c:
        rows = c.execute('''
            SELECT st.*, u.firstname, u.lastname, u.email
            FROM support_tickets st
            JOIN users u ON st.user_id = u.id
            ORDER BY st.created_at DESC
        ''').fetchall()
        return [dict(row) for row in rows]

def get_support_ticket(ticket_id):
    """Get a specific support ticket by ticket_id"""
    with _get_conn() as c:
        row = c.execute('SELECT * FROM support_tickets WHERE ticket_id = ?', (ticket_id,)).fetchone()
        return dict(row) if row else None

def update_support_ticket(ticket_id, status=None, admin_reply=None):
    """Update support ticket status and/or add admin reply"""
    with _get_conn() as c:
        updates = []
        params = []
        updated_at = datetime.now().isoformat()
        
        if status is not None:
            updates.append('status = ?')
            params.append(status)
            if status.lower() == 'resolved':
                updates.append('resolved_at = ?')
                params.append(updated_at)
        
        if admin_reply is not None:
            updates.append('admin_reply = ?')
            params.append(admin_reply)
        
        updates.append('updated_at = ?')
        params.append(updated_at)
        params.append(ticket_id)
        
        c.execute(f'''
            UPDATE support_tickets 
            SET {', '.join(updates)}
            WHERE ticket_id = ?
        ''', params)
        c.commit()
        
        return get_support_ticket(ticket_id)

def delete_support_ticket(ticket_id):
    """Delete a support ticket"""
    with _get_conn() as c:
        cursor = c.execute('DELETE FROM support_tickets WHERE ticket_id = ?', (ticket_id,))
        c.commit()
        return cursor.rowcount > 0

def init_contacts_table():
    with _get_conn() as c:
        c.execute('''
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT NOT NULL,
                message TEXT NOT NULL,
                status TEXT DEFAULT 'new',
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        ''')

init_contacts_table()

def create_contact(name, email, subject, message):
    created_at = datetime.now().isoformat()
    with _get_conn() as c:
        cursor = c.execute(
            'INSERT INTO contacts (name, email, subject, message, status, created_at) VALUES (?, ?, ?, ?, "new", ?)',
            (name, email, subject, message, created_at)
        )
        return {'id': cursor.lastrowid, 'ticket_id': f"CONTACT-{cursor.lastrowid}", 'status': 'new'}

def get_contacts():
    with _get_conn() as c:
        rows = c.execute('SELECT * FROM contacts ORDER BY created_at DESC').fetchall()
        return [dict(row) for row in rows]

def update_contact_status(contact_id, status):
    with _get_conn() as c:
        c.execute('UPDATE contacts SET status = ?, updated_at = datetime("now") WHERE id = ?', (status, contact_id))
        return True


def ensure_avatar_column():
    with _get_conn() as c:
        # Users table
        rows = c.execute("PRAGMA table_info(users)").fetchall()
        if not any(r[1] == 'avatar' for r in rows):
            c.execute('ALTER TABLE users ADD COLUMN avatar TEXT')
            c.commit()
        
        # Admins table
        rows = c.execute("PRAGMA table_info(admins)").fetchall()
        if not any(r[1] == 'avatar' for r in rows):
            c.execute('ALTER TABLE admins ADD COLUMN avatar TEXT')
            c.commit()


def ensure_updated_at_columns():
    """Add updated_at column to users and admins tables if missing."""
    with _get_conn() as c:
        # Users table
        rows = c.execute("PRAGMA table_info(users)").fetchall()
        if not any(r[1] == 'updated_at' for r in rows):
            c.execute('ALTER TABLE users ADD COLUMN updated_at TEXT')
            c.commit()
        
        # Admins table
        rows = c.execute("PRAGMA table_info(admins)").fetchall()
        if not any(r[1] == 'updated_at' for r in rows):
            c.execute('ALTER TABLE admins ADD COLUMN updated_at TEXT')
            c.commit()


def update_user_profile(user_id, firstname=None, lastname=None, phone=None, avatar=None, notifications=None):
    import json
    with _get_conn() as c:
        updates = []
        params = []
        if firstname is not None:
            updates.append('firstname=?')
            params.append(firstname)
        if lastname is not None:
            updates.append('lastname=?')
            params.append(lastname)
        if phone is not None:
            updates.append('phone=?')
            params.append(phone)
        if avatar is not None:
            updates.append('avatar=?')
            params.append(avatar)
        if notifications is not None:
            updates.append('notifications=?')
            params.append(json.dumps(notifications))
        updates.append('updated_at=datetime("now")')
        if updates:
            query = f"UPDATE users SET {', '.join(updates)} WHERE id=?"
            params.append(user_id)
            c.execute(query, tuple(params))
        row = c.execute(
            'SELECT id, email, firstname, lastname, phone, avatar, notifications, created_at, (firstname || " " || lastname) as name FROM users WHERE id=?',
            (user_id,)
        ).fetchone()
        if row:
            row = dict(row)
            row['name'] = row['name'].strip() if row['name'] else ''
            if row['notifications']:
                row['notifications'] = json.loads(row['notifications'])
            return row
        return None


def update_admin_profile(user_id, firstname=None, lastname=None, phone=None, avatar=None, notifications=None):
    import json
    with _get_conn() as c:
        updates = []
        params = []
        if firstname is not None:
            updates.append('firstname=?')
            params.append(firstname)
        if lastname is not None:
            updates.append('lastname=?')
            params.append(lastname)
        if phone is not None:
            updates.append('phone=?')
            params.append(phone)
        if avatar is not None:
            updates.append('avatar=?')
            params.append(avatar)
        if notifications is not None:
            updates.append('notifications=?')
            params.append(json.dumps(notifications))
        updates.append('updated_at=datetime("now")')
        if updates:
            query = f"UPDATE admins SET {', '.join(updates)} WHERE id=?"
            params.append(user_id)
            c.execute(query, tuple(params))
        row = c.execute(
            'SELECT id, email, firstname, lastname, phone, avatar, notifications, role, created_at, (firstname || " " || lastname) as name FROM admins WHERE id=?',
            (user_id,)
        ).fetchone()
        if row:
            row = dict(row)
            row['name'] = row['name'].strip() if row['name'] else ''
            if row['notifications']:
                row['notifications'] = json.loads(row['notifications'])
            return row
        return None


ensure_avatar_column()
ensure_updated_at_columns()
