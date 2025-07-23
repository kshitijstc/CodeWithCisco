from collections import defaultdict, deque

METRICS = {}
ALERTS = []
ACTIONS = []
PROFILES = {}

HISTORICAL_METRICS = defaultdict(lambda: deque(maxlen=100))  # last 100 records per agent

def upsert_metrics(record):
    METRICS[record["agent_id"]] = record

def list_metrics():
    return list(METRICS.values())

def log_alert(alert):
    ALERTS.append(alert)

def list_alerts():
    return ALERTS

def log_action(action):
    ACTIONS.append(action)

def list_actions():
    return ACTIONS

def upsert_profile(profile):
    PROFILES[profile["agent_id"]] = profile

def list_profiles():
    return list(PROFILES.values())

def add_historical_metric(record):
    HISTORICAL_METRICS[record["agent_id"]].append(record)

def get_historical_metrics(agent_id):
    return list(HISTORICAL_METRICS[agent_id]) 