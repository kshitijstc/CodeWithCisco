from collections import defaultdict, deque
import numpy as np
from database import PROFILES

def detect_ddos(metrics_window):
    # Input: List[Dict] of past metrics (eg., past 30 sec)
    pps = [m['packets_per_sec'] for m in metrics_window]
    avg = sum(pps[:-1]) / max(len(pps) - 1, 1)
    if pps[-1] > avg * 2.5:
        return True
    return False

def detect_rogue_cpu_spike(data, known_procs):
    for proc in data['per_process']:
        if proc['cpu'] > 50 and proc['name'] not in known_procs:
            return {
                "status": "ROGUE_AGENT_DETECTED",
                "offending_proc": proc
            }
    return {"status":"NORMAL"}





def detect_malware_flow(metric_record):
    # Example: flag if outbound connections > threshold
    net_io = metric_record.get("net_io", {})
    if net_io.get("outbound_connections", 0) > 100:
        return {"type": "MALWARE_FLOW", "details": {"outbound_connections": net_io["outbound_connections"]}}
    return None

def detect_unrecognized_agent(metric_record):
    agent_id = metric_record.get("agent_id")
    if agent_id not in PROFILES:
        return {"type": "UNRECOGNIZED_AGENT", "details": {"agent_id": agent_id}}
    return None

def predict_traffic_spike(agent_id):
    history = get_historical_metrics(agent_id)
    if len(history) < 10:
        return None
    traffic = np.array([rec["net_io"]["sent"] + rec["net_io"]["recv"] for rec in history if "net_io" in rec])
    if len(traffic) < 10:
        return None
    # Simple trend: compare last 5 to previous 5
    if traffic[-5:].mean() > 2 * traffic[-10:-5].mean():
        return {"type": "PREDICTED_TRAFFIC_SPIKE", "details": {"predicted_traffic": float(traffic[-5:].mean())}}
    return None

def predict_cpu_bottleneck(agent_id):
    history = get_historical_metrics(agent_id)
    if len(history) < 10:
        return None
    cpu_usage = np.array([rec["cpu"] for rec in history if "cpu" in rec])
    if len(cpu_usage) < 10:
        return None
    # Simple trend: compare last 5 to previous 5
    if cpu_usage[-5:].mean() > 2 * cpu_usage[-10:-5].mean():
        return {"type": "PREDICTED_CPU_BOTTLENECK", "details": {"predicted_cpu": float(cpu_usage[-5:].mean())}}
    return None

def detect_ml_anomaly(agent_id):
    history = get_historical_metrics(agent_id)
    if len(history) < 10:
        return None
    
    # Example: IsolationForest for CPU anomaly
    cpu_values = np.array([rec["cpu"] for rec in history if "cpu" in rec])
    if len(cpu_values) < 10:
        return None
    
    # Fit IsolationForest on historical data
    from sklearn.ensemble import IsolationForest
    clf = IsolationForest(contamination=0.05, random_state=42) # 5% contamination
    clf.fit(cpu_values.reshape(-1, 1))

