import json
import os
import uuid
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Create YooKassa payment for hive rental
    Args: event with httpMethod, body containing amount and description
    Returns: Payment URL or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    shop_id = os.environ.get('YOOKASSA_SHOP_ID')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY')
    
    if not shop_id or not secret_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Payment gateway not configured'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    amount = body_data.get('amount', 24000)
    description = body_data.get('description', 'Аренда улья')
    user_id = event.get('headers', {}).get('x-user-id', 'anonymous')
    
    import base64
    import requests
    
    auth_string = f"{shop_id}:{secret_key}"
    auth_bytes = auth_string.encode('utf-8')
    auth_b64 = base64.b64encode(auth_bytes).decode('utf-8')
    
    idempotence_key = str(uuid.uuid4())
    
    payment_data = {
        "amount": {
            "value": f"{amount}.00",
            "currency": "RUB"
        },
        "confirmation": {
            "type": "redirect",
            "return_url": event.get('headers', {}).get('origin', 'https://app.poehali.dev')
        },
        "capture": True,
        "description": description,
        "metadata": {
            "user_id": user_id
        }
    }
    
    response = requests.post(
        'https://api.yookassa.ru/v3/payments',
        json=payment_data,
        headers={
            'Authorization': f'Basic {auth_b64}',
            'Idempotence-Key': idempotence_key,
            'Content-Type': 'application/json'
        }
    )
    
    if response.status_code == 200:
        payment_info = response.json()
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'payment_id': payment_info['id'],
                'payment_url': payment_info['confirmation']['confirmation_url'],
                'status': payment_info['status']
            }),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': response.status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Payment creation failed', 'details': response.text}),
        'isBase64Encoded': False
    }
