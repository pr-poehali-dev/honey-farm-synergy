import json
import os
from typing import Dict, Any, List
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage user notifications for hive events
    Args: event with httpMethod (GET for list, POST for create)
    Returns: Notifications list or creation confirmation
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    user_id = event.get('headers', {}).get('x-user-id', 'demo_user')
    
    notifications: List[Dict[str, Any]] = [
        {
            'id': '1',
            'type': 'harvest_progress',
            'title': 'Ваши пчелы начали собирать мед',
            'message': 'Сезон начался! Прогресс: 75%',
            'icon': '🐝',
            'timestamp': '2024-11-28T10:30:00Z',
            'read': False
        },
        {
            'id': '2',
            'type': 'warehouse_update',
            'title': 'Товар поступил на склад',
            'message': '+53 кг меда в сотах',
            'icon': '📦',
            'timestamp': '2024-11-26T14:20:00Z',
            'read': True
        },
        {
            'id': '3',
            'type': 'season_complete',
            'title': 'Сезон сбора меда завершился',
            'message': 'В этом сезоне ваш улей принес 53 кг меда',
            'icon': '🎉',
            'timestamp': '2024-11-25T09:00:00Z',
            'read': True
        },
        {
            'id': '4',
            'type': 'metrics_alert',
            'title': 'Температура улья в норме',
            'message': 'Улей №1: +34°C, влажность 65%',
            'icon': '🌡️',
            'timestamp': '2024-11-28T08:00:00Z',
            'read': False
        }
    ]
    
    if method == 'GET':
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'notifications': notifications,
                'unread_count': sum(1 for n in notifications if not n['read'])
            }),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        new_notification = {
            'id': str(len(notifications) + 1),
            'type': body_data.get('type', 'custom'),
            'title': body_data.get('title', 'Новое уведомление'),
            'message': body_data.get('message', ''),
            'icon': body_data.get('icon', '🔔'),
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'read': False
        }
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'notification': new_notification,
                'message': 'Notification created'
            }),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
