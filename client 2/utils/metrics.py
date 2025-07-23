import psutil
from datetime import datetime
import os
import json


ATTACK_FLAG_PATH = "attack_status.json"

def load_latest_log():
    logs_path = "logs"
    if not os.path.exists(logs_path):
        return None

    log_files = sorted(
        [f for f in os.listdir(logs_path) if f.startswith("window_") and f.endswith(".json")],
        key=lambda x: int(x.split("_")[1].split(".")[0]),
        reverse=True
    )

    if not log_files:
        return None

    with open(os.path.join(logs_path, log_files[0]), "r") as f:
        return json.load(f)
        
def get_system_metrics():
    cpu = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    network = psutil.net_io_counters()

    return {
        'timestamp': datetime.now(),
        'cpu_usage': cpu,
        'memory_usage': memory.percent,
        'memory_available': memory.available / (1024**3),
        'memory_total': memory.total / (1024**3),
        'disk_usage': disk.percent,
        'disk_free': disk.free / (1024**3),
        'disk_total': disk.total / (1024**3),
        'network_sent': network.bytes_sent / (1024**2),
        'network_recv': network.bytes_recv / (1024**2),
    }



def get_attack_status():
    if not os.path.exists(ATTACK_FLAG_PATH):
        return False, None
    with open(ATTACK_FLAG_PATH, "r") as f:
        data = json.load(f)
        return data.get("attack_detected", False), data.get("timestamp")

def clear_attack_status():
    if os.path.exists(ATTACK_FLAG_PATH):
        os.remove(ATTACK_FLAG_PATH)