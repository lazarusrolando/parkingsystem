import hmac
import hashlib
import base64
import json
import time
import requests
import os

RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', 'razorpay_key_id_here')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', 'razorpay_key_secret_here')
RAZORPAY_WEBHOOK_SECRET = os.environ.get('RAZORPAY_WEBHOOK_SECRET', 'razorpay_webhook_secret')

API_BASE_URL = 'https://api.razorpay.com/v1'


def create_order(amount, currency='INR', receipt=None, notes=None):
    payload = {
        'amount': int(amount * 100),
        'currency': currency,
        'receipt': receipt or f'receipt_{int(time.time())}',
    }
    if notes:
        payload['notes'] = notes

    response = requests.post(
        f'{API_BASE_URL}/orders',
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
        json=payload
    )
    if response.status_code == 200:
        return response.json()
    return {'error': response.text, 'status_code': response.status_code}


def get_order(order_id):
    response = requests.get(
        f'{API_BASE_URL}/orders/{order_id}',
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
    )
    if response.status_code == 200:
        return response.json()
    return {'error': response.text, 'status_code': response.status_code}


def get_payment(order_id):
    response = requests.get(
        f'{API_BASE_URL}/orders/{order_id}/payments',
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
    )
    if response.status_code == 200:
        payments = response.json().get('items', [])
        return payments[0] if payments else None
    return None


def verify_payment_signature(order_id, payment_id, signature):
    payload = f'{order_id}|{payment_id}'
    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected_signature)


def verify_webhook_signature(webhook_body, signature):
    expected_signature = hmac.new(
        RAZORPAY_WEBHOOK_SECRET.encode(),
        webhook_body.encode(),
        hashlib.sha256
    ).digest()
    expected_b64 = base64.b64encode(expected_signature).decode()
    return hmac.compare_digest(expected_b64, signature)


def get_key_details():
    return {
        'key_id': RAZORPAY_KEY_ID,
    }


def refund_payment(payment_id, amount=None):
    payload = {}
    if amount:
        payload['amount'] = int(amount * 100)

    response = requests.post(
        f'{API_BASE_URL}/payments/{payment_id}/refund',
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
        json=payload
    )
    if response.status_code == 200:
        return response.json()
    return {'error': response.text, 'status_code': response.status_code}