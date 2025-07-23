from datetime import datetime

def remediate(alert):
    if alert["type"] == "CPU_SPIKE":
        return {
            "action": "offload",
            "target": alert["details"].get("agent_id"),
            "timestamp": datetime.utcnow().isoformat()
        }
    # Add more remediation logic here
    return None 