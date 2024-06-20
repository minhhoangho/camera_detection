from src.settings.components import config

Q_CLUSTER = {
    'name': 'default_q_cluster',
    'workers': 3,
    'recycle': 500,
    'timeout': 60,
    'compress': True,
    'save_limit': 250,
    'queue_limit': 500,
    'cpu_affinity': 1,
    'label': 'Django Q',
    'redis': {
        'host': config("REDIS_HOST", default="127.0.0.1"),
        'port': config("REDIS_PORT", default="6379"),
        'db': 1,
    }
}
