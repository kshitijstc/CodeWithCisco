from fastapi import APIRouter
from database import log_action, list_actions

router = APIRouter()

@router.post("/")
async def post_action(action: dict):
    log_action(action)
    return {"msg": "Action logged"}

@router.get("/")
def get_actions():
    return list_actions() 