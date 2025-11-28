import json
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Provide live camera streams from hives
    Args: event with httpMethod, optional hive_id query param
    Returns: List of available camera streams
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    hive_id = params.get('hive_id')
    
    cameras: List[Dict[str, Any]] = [
        {
            'id': 'cam_1',
            'hive_id': 'hive_altai_001',
            'region': 'Алтай',
            'name': 'Улей Классический #1',
            'status': 'online',
            'stream_url': 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
            'thumbnail': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&auto=format&fit=crop',
            'viewers': 12,
            'temperature': 34,
            'humidity': 65
        },
        {
            'id': 'cam_2',
            'hive_id': 'hive_crimea_002',
            'region': 'Крым',
            'name': 'Улей Колода #2',
            'status': 'online',
            'stream_url': 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
            'thumbnail': 'https://images.unsplash.com/photo-1568526381923-caf3fd520382?w=800&auto=format&fit=crop',
            'viewers': 8,
            'temperature': 32,
            'humidity': 68
        },
        {
            'id': 'cam_3',
            'hive_id': 'hive_bashkiria_003',
            'region': 'Башкирия',
            'name': 'Улей Классический #3',
            'status': 'online',
            'stream_url': 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
            'thumbnail': 'https://images.unsplash.com/photo-1587049352846-4a222e784210?w=800&auto=format&fit=crop',
            'viewers': 15,
            'temperature': 35,
            'humidity': 62
        }
    ]
    
    if hive_id:
        cameras = [cam for cam in cameras if cam['hive_id'] == hive_id]
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'cameras': cameras,
            'total_viewers': sum(cam['viewers'] for cam in cameras),
            'subscription_price': 99
        }),
        'isBase64Encoded': False
    }
