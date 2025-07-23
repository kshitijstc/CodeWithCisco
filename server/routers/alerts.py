from fastapi import APIRouter
from ai.anomaly_detector import detect
from database import log_alert, list_alerts

router = APIRouter()

@router.post("/")
async def post_alerts(metric_record: dict):
    alerts = detect(metric_record)
    if alerts:
        for alert in alerts:
            log_alert(alert)
        return {"alerts": alerts}
    return {"msg": "OK"}

@router.get("/")
def get_alerts():
    return list_alerts() 