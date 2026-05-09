import json
import os
import re
import threading
import queue
import time
import uuid
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import requests
import ollama

import db
from db import get_session, create_session, delete_session
import payment
import random
from datetime import datetime, timedelta

SSE_SUBSCRIBERS = []
SSE_LOCK = threading.Lock()

OLLAMA_URL = 'http://localhost:11434/api/chat'
DEFAULT_MODEL = os.getenv('OLLAMA_MODEL', 'qwen3.5')

def broadcast_event(event_name, data):
    payload = f"event: {event_name}\n" + f"data: {json.dumps(data)}\n\n"
    with SSE_LOCK:
        for q in list(SSE_SUBSCRIBERS):
            try:
                q.put(payload, block=False)
            except queue.Full:
                pass

def _strip_think_tags(text):
    return re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()

def call_ollama_agent(system_prompt_with_user_query):
    print(f"[Smart Parking Agent] Using Ollama '{DEFAULT_MODEL}'")
    try:
        response = ollama.chat(
            model=DEFAULT_MODEL,
            messages=[{'role': 'user', 'content': system_prompt_with_user_query}],
            options={'temperature': 0.2, 'top_p': 0.95, 'num_predict': 1024},
            think=False
        )
        print(f"[Smart Parking Agent] Response received (done_reason={response.done_reason})")
        text = response.message.content or ''
        text = _strip_think_tags(text)
        if not text:
            print(f"[Smart Parking Agent] Warning: Empty response from Ollama")
            return ""
        print(f"[Smart Parking Agent] Ollama response length: {len(text)}")
        return text
    except ollama.ResponseError as e:
        print(f"[Smart Parking Agent] Ollama ResponseError: {e}")
        return ""
    except Exception as e:
        print(f"[Smart Parking Agent] Exception: {type(e).__name__}: {e}")
        return ""

def _read_json(rfile, length):
    raw = rfile.read(length)
    try:
        return json.loads(raw.decode('utf-8'))
    except Exception:
        return None

def send_json_response(obj, status=200):
    """Helper to create JSON response data"""
    return {'data': obj, 'status': status}

def get_authenticated_user(headers):
    """Extract user from Authorization header"""
    auth = headers.get('Authorization', '')
    if auth.lower().startswith('bearer '):
        token = auth.split(' ', 1)[1].strip()
        return get_session(token)
    return None

# --- Support Tickets API Handlers ---

def handle_support_tickets(method, path, body, headers, send_json_func):
    user = get_authenticated_user(headers)
    if not user:
        return send_json_func({'error': 'not authenticated'}, status=401)
    
    if method == 'GET':
        # Get tickets - users see their own, admins see all
        if user.get('role') == 'admin':
            tickets = db.get_all_support_tickets()
        else:
            tickets = db.get_support_tickets_by_user(user['id'])
        return send_json_func({'tickets': tickets})
    
    elif method == 'POST':
        # Create new ticket
        required_fields = ['category', 'subject']
        if not all(k in body for k in required_fields):
            return send_json_func({'error': 'missing required fields: category, subject'}, status=400)
        
        ticket = db.create_support_ticket(
            user_id=user['id'],
            category=body['category'],
            priority=body.get('priority', 'Low'),
            subject=body['subject'],
            description=body.get('description', '')
        )
        return send_json_func({'ticket': ticket}, status=201)
    
    return send_json_func({'error': 'method not allowed'}, status=405)

def handle_support_ticket(method, path, body, headers, send_json_func):
    user = get_authenticated_user(headers)
    if not user:
        return send_json_func({'error': 'not authenticated'}, status=401)
    
    # Extract ticket_id from path
    parts = path.split('/')
    if len(parts) < 3:
        return send_json_func({'error': 'invalid ticket path'}, status=400)
    
    ticket_id = parts[2]
    ticket = db.get_support_ticket(ticket_id)
    
    if not ticket:
        return send_json_func({'error': 'ticket not found'}, status=404)
    
    # Users can only access their own tickets
    if user.get('role') != 'admin' and ticket['user_id'] != user['id']:
        return send_json_func({'error': 'unauthorized'}, status=403)
    
    if method == 'GET':
        return send_json_func({'ticket': ticket})
    
    elif method == 'PUT' or method == 'PATCH':
        # Update ticket (admins can update status and reply)
        if user.get('role') == 'admin':
            updated = db.update_support_ticket(
                ticket_id,
                status=body.get('status'),
                admin_reply=body.get('admin_reply')
            )
            return send_json_func({'ticket': updated})
        else:
            return send_json_func({'error': 'only admins can update tickets'}, status=403)
    
    elif method == 'DELETE':
        # Delete ticket (admins only)
        if user.get('role') != 'admin':
            return send_json_func({'error': 'only admins can delete tickets'}, status=403)
        
        if db.delete_support_ticket(ticket_id):
            return send_json_func({'success': True})
        return send_json_func({'error': 'failed to delete ticket'}, status=500)
    
    return send_json_func({'error': 'method not allowed'}, status=405)

class ParkingRequestHandler(BaseHTTPRequestHandler):
    server_version = "ParkingBackend/1.0"

    def _send_json(self, obj, status=200):
        body = json.dumps(obj).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        self.wfile.write(body)

    def _send_text(self, text, status=200, extra_headers=None):
        self.send_response(status)
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.send_header('Content-Length', str(len(text.encode('utf-8'))))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache')
        if extra_headers:
            for k, v in extra_headers.items():
                self.send_header(k, v)
        self.end_headers()
        self.wfile.write(text.encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def _get_authenticated_user(self):
        auth = self.headers.get('Authorization', '')
        if auth.startswith('Bearer '):
            token = auth.split(' ', 1)[1].strip()
            return get_session(token)
        return None

    def do_GET(self):
        pr = urlparse(self.path)
        path = pr.path

        if path == '/api/slots':
            slots = db.get_slots()
            return self._send_json({'slots': slots})

        if path == '/api/me':
            user = self._get_authenticated_user()
            if not user:
                return self._send_json({'error': 'not authenticated'}, status=401)
            # Refresh user data from database to get latest profile
            if user.get('role') == 'admin':
                admin = db.get_admin_by_email(user['email'])
                if admin:
                    user = {
                        'id': admin['id'],
                        'email': admin['email'],
                        'name': admin.get('name') or '',
                        'firstname': admin.get('firstname') or '',
                        'lastname': admin.get('lastname') or '',
                        'phone': admin.get('phone') or '',
                        'avatar': admin.get('avatar') or '',
                        'notifications': admin.get('notifications', {'push':True,'email':False,'sms':True}),
                        'role': 'admin'
                    }
            else:
                db_user = db.get_user_by_email(user['email'])
                if db_user:
                    user = {
                        'id': db_user['id'],
                        'email': db_user['email'],
                        'name': db_user.get('name') or '',
                        'firstname': db_user.get('firstname') or '',
                        'lastname': db_user.get('lastname') or '',
                        'phone': db_user.get('phone') or '',
                        'avatar': db_user.get('avatar') or '',
                        'notifications': db_user.get('notifications', {'push':True,'email':False,'sms':True}),
                        'role': 'user'
                    }
            return self._send_json({'user': user})

        if path == '/api/slots/available':
            slots = db.get_slots_by_status('available')
            return self._send_json({'slots': slots})

        if path == '/api/slots/booked':
            slots = db.get_slots_by_status('booked')
            return self._send_json({'slots': slots})

        # Support Tickets API
        if path == '/api/support-tickets':
            return handle_support_tickets('GET', path, {}, self.headers, self._send_json)
        
        if path.startswith('/api/support-tickets/') and len(path.split('/')) >= 3:
            return handle_support_ticket('GET', path, {}, self.headers, self._send_json)

        if path.startswith('/api/slots/'):
            try:
                slot_id = int(path.split('/')[-1])
            except ValueError:
                return self._send_json({'error': 'invalid slot id'}, status=400)
            slot = db.get_slot(slot_id)
            if not slot:
                return self._send_json({'error': 'slot not found'}, status=404)
            return self._send_json({'slot': slot})

        if path == '/api/bookings':
            active_flag = pr.query.lower() == 'active=true'
            if active_flag:
                bookings = db.get_bookings(active_only=True)
            else:
                bookings = db.get_bookings(active_only=False)
            return self._send_json({'bookings': bookings})

        if path == '/api/sse':
            return self.handle_sse()

        if path == '/api/history':
            bookings = db.get_bookings(active_only=False)
            return self._send_json({'history': bookings})

        if path == '/api/users':
            user = self._get_authenticated_user()
            if not user or user.get('role') != 'admin':
                return self._send_json({'error': 'admin only'}, status=403)
            users = db.get_all_users()
            return self._send_json({'users': users})

        if path == '/api/admins':
            user = self._get_authenticated_user()
            if not user or user.get('role') != 'admin':
                return self._send_json({'error': 'admin only'}, status=403)
            admins = db.get_all_admins()
            return self._send_json({'admins': admins})

        if path == '/api/admin-stats':
            user = self._get_authenticated_user()
            if not user or user.get('role') != 'admin':
                return self._send_json({'error': 'admin only'}, status=403)
            stats = db.get_admin_stats()
            return self._send_json({'stats': stats})

        if path == '/api/vehicles':
            user = self._get_authenticated_user()
            if not user:
                return self._send_json({'error': 'not authenticated'}, status=401)
            vehicles = db.get_user_vehicles(user['id'])
            return self._send_json({'vehicles': vehicles})

        if path == '/api/wallet':
            user = self._get_authenticated_user()
            if not user:
                return self._send_json({'error': 'not authenticated'}, status=401)
            wallet = db.get_user_wallet(user['id'])
            return self._send_json({'wallet': wallet})

        if path == '/api/payments':
            user = self._get_authenticated_user()
            if not user:
                return self._send_json({'error': 'not authenticated'}, status=401)
            payments = db.get_user_payments(user['id'])
            return self._send_json({'payments': payments})

        if path == '/api/payment/key':
            key_details = payment.get_key_details()
            return self._send_json({'key': key_details})

        if path == '/api/payment/webhook':
            return self.handle_payment_webhook()

        return self._send_json({'error': 'not found'}, status=404)

    def do_POST(self):
        path = urlparse(self.path).path
        print(f"[DEBUG] POST {path} body len={self.headers.get('Content-Length', 0)}")
        length = int(self.headers.get('Content-Length', 0))
        body = _read_json(self.rfile, length) if length else {}
        if body is None or not isinstance(body, dict):
            body = {}

        # Auth endpoints
        if path == '/api/register':
            if not all(k in body for k in ['email', 'password']):
                return self._send_json({'error': 'missing email or password'}, status=400)
            email_lower = body['email'].lower()
            if '@sps.com' in email_lower:
                try:
                    admin = db.create_admin(body['email'], body['password'], 
                                      body.get('firstname'), body.get('lastname'), body.get('phone'))
                    token = str(uuid.uuid4())
                    db.create_session(token, admin)
                    user_data = {
                        'id': admin['id'],
                        'email': admin['email'],
                        'name': admin.get('name') or '',
                        'firstname': admin.get('firstname') or '',
                        'lastname': admin.get('lastname') or '',
                        'phone': admin.get('phone') or '',
                        'role': 'admin'
                    }
                    return self._send_json({'token': token, 'user': user_data})
                except Exception as e:
                    print(f"[ADMIN REGISTER ERROR] {e}")
                    return self._send_json({'error': str(e)}, status=400)
            else:
                try:
                    user = db.create_user(body['email'], body['password'], 
                                      body.get('firstname'), body.get('lastname'), body.get('phone'))
                    token = str(uuid.uuid4())
                    db.create_session(token, user)
                    user_data = {
                        'id': user['id'],
                        'email': user['email'],
                        'name': user.get('name') or '',
                        'firstname': user.get('firstname') or '',
                        'lastname': user.get('lastname') or '',
                        'phone': user.get('phone') or '',
                        'role': 'user'
                    }
                    return self._send_json({'token': token, 'user': user_data})
                except Exception as e:
                    print(f"[USER REGISTER ERROR] {e}")
                    return self._send_json({'error': str(e)}, status=400)

        if path == '/api/login':
            if not all(k in body for k in ['email', 'password']):
                return self._send_json({'error': 'missing email or password'}, status=400)
            email_lower = body['email'].lower()
            if '@sps.com' in email_lower:
                admin = db.verify_admin(body['email'], body['password'])
                if not admin:
                    return self._send_json({'error': 'invalid credentials'}, status=401)
                token = str(uuid.uuid4())
                db.create_session(token, admin)
                user_data = {
                    'id': admin['id'],
                    'email': admin['email'],
                    'name': admin.get('name') or '',
                    'firstname': admin.get('firstname') or '',
                    'lastname': admin.get('lastname') or '',
                    'phone': admin.get('phone') or '',
                    'role': 'admin'
                }
                return self._send_json({'token': token, 'user': user_data})
            else:
                user = db.verify_user(body['email'], body['password'])
                if not user:
                    return self._send_json({'error': 'invalid credentials'}, status=401)
                token = str(uuid.uuid4())
                db.create_session(token, user)
                user_data = {
                    'id': user['id'],
                    'email': user['email'],
                    'name': user.get('name') or '',
                    'firstname': user.get('firstname') or '',
                    'lastname': user.get('lastname') or '',
                    'phone': user.get('phone') or '',
                    'role': 'user'
                }
                return self._send_json({'token': token, 'user': user_data})

        if path == '/api/logout':
            user = self._get_authenticated_user()
            if user:
                auth = self.headers.get('Authorization', '')
                token = ''
                if auth.startswith('Bearer '):
                    token = auth.split(' ', 1)[1].strip()
                if token:
                    db.delete_session(token)
            return self._send_json({'success': True})

        # Existing parking endpoints
        if path == '/api/vehicles':
            user = self._get_authenticated_user()
            if not user:
                return self._send_json({'error': 'not authenticated'}, status=401)
            name = body.get('name')
            plate = body.get('plate')
            if not name or not plate:
                return self._send_json({'error': 'missing name or plate'}, status=400)
            vehicles = db.add_user_vehicle(user['id'], name, plate)
            return self._send_json({'vehicles': vehicles})

        if path == '/api/vehicles/default':
            user = self._get_authenticated_user()
            if not user:
                return self._send_json({'error': 'not authenticated'}, status=401)
            vehicle_id = body.get('vehicle_id')
            if not vehicle_id:
                return self._send_json({'error': 'missing vehicle_id'}, status=400)
            success = db.set_default_vehicle(vehicle_id)
            if success:
                return self._send_json({'success': True})
            return self._send_json({'error': 'vehicle not found'}, status=404)

        if path == '/api/wallet':
            user = self._get_authenticated_user()
            if not user:
                return self._send_json({'error': 'not authenticated'}, status=401)
            delta = body.get('delta', 0)
            try:
                wallet = db.update_user_wallet(user['id'], delta)
                return self._send_json({'wallet': wallet})
            except Exception as e:
                return self._send_json({'error': str(e)}, status=400)

        if path == '/api/payment/create-order':
            user = self._get_authenticated_user()
            if not user:
                return self._send_json({'error': 'not authenticated'}, status=401)
            amount = body.get('amount')
            if not amount or amount <= 0:
                return self._send_json({'error': 'invalid amount'}, status=400)
            try:
                order = payment.create_order(
                    amount=amount,
                    receipt=f'wallet_topup_{user["id"]}_{int(time.time())}',
                    notes={'user_id': str(user['id']), 'type': 'wallet_topup'}
                )
                if 'error' in order:
                    return self._send_json({'error': order['error']}, status=order.get('status_code', 500))
                db.create_payment_record(
                    payment_id=order['id'],
                    order_id=order['id'],
                    user_id=user['id'],
                    amount=amount
                )
                return self._send_json({'order': order})
            except Exception as e:
                return self._send_json({'error': str(e)}, status=500)

        if path == '/api/payment/verify':
            user = self._get_authenticated_user()
            if not user:
                return self._send_json({'error': 'not authenticated'}, status=401)
            order_id = body.get('order_id')
            payment_id = body.get('payment_id')
            signature = body.get('signature')
            if not all([order_id, payment_id, signature]):
                return self._send_json({'error': 'missing required fields'}, status=400)
            if not payment.verify_payment_signature(order_id, payment_id, signature):
                return self._send_json({'error': 'invalid signature'}, status=400)
            try:
                order = payment.get_order(order_id)
                if 'error' in order:
                    return self._send_json({'error': order['error']}, status=order.get('status_code', 500))
                amount = order.get('amount', 0) / 100
                db.update_payment_status(
                    order_id,
                    status='captured',
                    razorpay_payment_id=payment_id,
                    razorpay_signature=signature
                )
                db.update_user_wallet(user['id'], amount)
                wallet = db.get_user_wallet(user['id'])
                return self._send_json({'wallet': wallet})
            except Exception as e:
                return self._send_json({'error': str(e)}, status=500)

        if path == '/api/book':
            user = self._get_authenticated_user()
            if not user:
                return self._send_json({'error': 'not authenticated'}, status=401)
            slot_id = body.get('slot_id')
            amount = body.get('amount', 0)
            if not slot_id:
                return self._send_json({'error': 'missing slot_id'}, status=400)
            try:
                slot = db.book_slot(slot_id, amount)
                with db._get_conn() as c:
                    c.execute('UPDATE bookings SET user_id=? WHERE slot_id=? AND status="active"', (user['id'], slot_id))
                return self._send_json({'slot': slot})
            except Exception as e:
                return self._send_json({'error': str(e)}, status=400)

        if path == '/api/release':
            user = self._get_authenticated_user()
            if not user:
                return self._send_json({'error': 'not authenticated'}, status=401)
            slot_id = body.get('slot_id')
            if not slot_id:
                return self._send_json({'error': 'missing slot_id'}, status=400)
            try:
                slot = db.release_slot(slot_id)
                return self._send_json({'slot': slot})
            except Exception as e:
                return self._send_json({'error': str(e)}, status=400)

        if path == '/api/create-slot':
            name = body.get('name')
            if not name:
                return self._send_json({'error': 'missing name'}, status=400)
            slot = db.create_slot(name)
            return self._send_json({'slot': slot})

        if path == '/api/update-slot':
            slot_id = body.get('id')
            name = body.get('name')
            status = body.get('status')
            if not slot_id:
                return self._send_json({'error': 'missing id'}, status=400)
            try:
                slot = db.update_slot(slot_id, name, status)
                return self._send_json({'slot': slot})
            except Exception as e:
                return self._send_json({'error': str(e)}, status=400)

        if path == '/api/cancel-booking':
            user = self._get_authenticated_user()
            if not user:
                return self._send_json({'error': 'not authenticated'}, status=401)
            booking_id = body.get('booking_id')
            if not booking_id:
                return self._send_json({'error': 'missing booking_id'}, status=400)
            try:
                slot = db.cancel_booking(booking_id)
                return self._send_json({'slot': slot})
            except Exception as e:
                return self._send_json({'error': str(e)}, status=400)

        if path == '/api/update-profile':
            user = self._get_authenticated_user()
            if not user:
                return self._send_json({'error': 'not authenticated'}, status=401)
            update_data = {
                'firstname': body.get('firstname'),
                'lastname': body.get('lastname'),
                'phone': body.get('phone'),
                'avatar': body.get('avatar'),
                'notifications': body.get('notifications')
            }
            if user.get('role') == 'admin':
                updated = db.update_admin_profile(user['id'], **update_data)
            else:
                updated = db.update_user_profile(user['id'], **update_data)
            if updated:
                return self._send_json({'user': updated})
            else:
                return self._send_json({'error': 'user not found'}, status=404)

        # Support Tickets API
        if path == '/api/support-tickets':
            handle_support_tickets('POST', path, body, self.headers, self._send_json)
            return
        
        if path.startswith('/api/support-tickets/') and len(path.split('/')) >= 3:
            handle_support_ticket('PUT', path, body, self.headers, self._send_json)
            return

        if path == '/api/contacts':
            required = ['full_name', 'email_address', 'subject', 'message']
            if not all(body.get(k) for k in required):
                return self._send_json({'error': 'missing required fields: full_name, email_address, subject, message'}, status=400)
            contact = db.create_contact(
                body['full_name'],
                body['email_address'],
                body['subject'],
                body['message']
            )
            return self._send_json({'contact': contact}, status=201)

        if path == '/api/admin/contacts':
            user = self._get_authenticated_user()
            if not user or user.get('role') != 'admin':
                return self._send_json({'error': 'admin only'}, status=403)
            if self.command == 'GET':
                contacts = db.get_contacts()
                return self._send_json({'contacts': contacts})
            return self._send_json({'error': 'method not allowed'}, status=405)

        if path == '/api/chat':
            question = body.get('question')
            if not question:
                return self._send_json({'error': 'missing question'}, status=400)
            answer = generate_chat_answer(question)
            return self._send_json({'answer': answer})

        return self._send_json({'error': 'not found'}, status=404)

    def handle_sse(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/event-stream')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Connection', 'keep-alive')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        q = queue.Queue(maxsize=100)
        with SSE_LOCK:
            SSE_SUBSCRIBERS.append(q)

        try:
            self.wfile.write(b': connected\n\n')
            self.wfile.flush()
            while True:
                try:
                    payload = q.get(timeout=25)
                    self.wfile.write(payload.encode('utf-8'))
                    self.wfile.flush()
                except queue.Empty:
                    self.wfile.write(b': ping\n\n')
                    self.wfile.flush()
                except BrokenPipeError:
                    break
        finally:
            with SSE_LOCK:
                if q in SSE_SUBSCRIBERS:
                    SSE_SUBSCRIBERS.remove(q)

    def handle_payment_webhook(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        signature = self.headers.get('X-Razorpay-Signature', '')
        if not signature:
            self.wfile.write(b'{"error": "missing signature"}')
            return

        length = int(self.headers.get('Content-Length', 0))
        raw_body = self.rfile.read(length) if length else b''

        if not payment.verify_webhook_signature(raw_body.decode('utf-8'), signature):
            self.wfile.write(b'{"error": "invalid signature"}')
            return

        try:
            event = json.loads(raw_body.decode('utf-8'))
        except Exception:
            self.wfile.write(b'{"error": "invalid json"}')
            return

        if not isinstance(event, dict):
            self.wfile.write(b'{"error": "invalid event format"}')
            return

        event_type = event.get('event')
        payload = event.get('payload', {})
        payment_entity = payload.get('payment', {})
        order_entity = payload.get('order', {})

        razorpay_payment_id = payment_entity.get('id')
        razorpay_order_id = order_entity.get('id')
        amount = payment_entity.get('amount', 0) / 100
        status = payment_entity.get('status')

        if event_type == 'payment.captured' and razorpay_order_id:
            payment_record = db.get_payment_record(razorpay_order_id)
            if payment_record:
                db.update_payment_status(
                    razorpay_order_id,
                    status='captured',
                    razorpay_payment_id=razorpay_payment_id
                )
                db.update_user_wallet(payment_record['user_id'], amount)
                broadcast_event('payment_success', {
                    'payment_id': razorpay_payment_id,
                    'order_id': razorpay_order_id,
                    'amount': amount
                })

        elif event_type == 'payment.failed' and razorpay_order_id:
            db.update_payment_status(razorpay_order_id, status='failed')
            broadcast_event('payment_failed', {
                'payment_id': razorpay_payment_id,
                'order_id': razorpay_order_id
            })

        self.wfile.write(b'{"received": true}')

    def log_message(self, format, *args):
        print("[BACKEND]", format % args)

def generate_chat_answer(question):
    q = str(question).strip()
    if not q:
        return "Please ask a question about parking, bookings, slots, or account usage."

    parkingData = db.get_slots()
    
    systemPrompt = f'''You are a Smart Parking Assistant for a Smart Parking System (SPS).

You help users with:
- Checking parking availability
- Recommending parking slots
- Estimating cost
- Giving directions
- Assisting booking

=====================
LIVE PARKING DATA:
{json.dumps(parkingData)}
=====================

RULES:
- Only use the given parking data
- Do NOT create or assume new slots
- If no slots available, say "No parking available"
- Keep answers short and clear (max 2 sentences)
- Prefer recommending available slots
- Cost = ₹20 per hour
- Do not give technical explanations

STYLE:
- Friendly
- Direct
- Simple English

User: {q}
Assistant:'''

    try:
        ollama_response = call_ollama_agent(systemPrompt)
        if ollama_response and isinstance(ollama_response, str) and ollama_response.strip():
            return ollama_response.strip()
    except Exception as e:
        print(f"[Chat Error] {e}")
    
    return "Sorry, I couldn't generate a response right now. Try asking about parking slots, availability, or bookings."

def run(host='0.0.0.0', port=9000):
    print(f"Starting backend at http://{host}:{port}")
    print(f"Ollama model: {DEFAULT_MODEL}")
    
    server = ThreadingHTTPServer((host, port), ParkingRequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('Stopping backend')
    finally:
        server.server_close()

if __name__ == '__main__':
    run()


# Minimal Flask WSGI wrapper for platforms that expect a top-level `app` (e.g. Vercel)
try:
    from flask import Flask, request, jsonify

    app = Flask(__name__)

    @app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])
    @app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])
    def _proxy(path):
        # Lightweight wrapper: provide a health endpoint and a generic 501 for other routes.
        if request.method == 'GET' and (path == '' or path == 'health'):
            return jsonify({'status': 'ok', 'message': 'Parking backend WSGI wrapper active'})
        # If you want full parity with the standalone server, consider routing individual endpoints here
        return jsonify({'error': 'WSGI wrapper active; run standalone server for full functionality'}), 501

except Exception:
    # If Flask is not available, expose a minimal WSGI fallback callable named `app`
    def _wsgi_fallback(environ, start_response):
        status = '501 Not Implemented'
        headers = [('Content-Type', 'application/json')]
        start_response(status, headers)
        return [json.dumps({'error': 'WSGI wrapper active; Flask not installed'}).encode('utf-8')]

    app = _wsgi_fallback
