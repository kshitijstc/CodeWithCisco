from fastapi import APIRouter, Query
import asyncio
import httpx

router = APIRouter()

async def simulate_attack(attack_type, agent_id, duration=10):
    url = "http://localhost:8000/alerts/"
    async with httpx.AsyncClient() as client:
        for i in range(duration):
            if attack_type == "cpu_spike":
                metric = {"agent_id": agent_id, "cpu": 95, "memory": 40, "net_io": {"sent": 100, "recv": 100}}
            elif attack_type == "memory_overload":
                metric = {"agent_id": agent_id, "cpu": 30, "memory": 95, "net_io": {"sent": 100, "recv": 100}}
            elif attack_type == "ddos":
                metric = {"agent_id": agent_id, "cpu": 80, "memory": 60, "net_io": {"sent": 100000, "recv": 100000}}
            elif attack_type == "rogue_agent":
                metric = {"agent_id": "rogue_" + agent_id, "cpu": 50, "memory": 50, "net_io": {"sent": 100, "recv": 100}}
            else:
                metric = {"agent_id": agent_id, "cpu": 10, "memory": 10, "net_io": {"sent": 10, "recv": 10}}
            await client.post(url, json=metric)
            await asyncio.sleep(1)  # 1 second between metrics

@router.post("/")
async def simulate(type: str = Query(..., enum=["cpu_spike", "memory_overload", "ddos", "rogue_agent"]), agent_id: str = "sim_agent"):
    asyncio.create_task(simulate_attack(type, agent_id))
    return {"msg": f"Simulating {type} attack on {agent_id}"} 