from fastapi import FastAPI
from routers import alerts, actions, simulation

app = FastAPI()

app.include_router(alerts.router, prefix="/alerts")
app.include_router(actions.router, prefix="/actions")
app.include_router(simulation.router, prefix="/simulate")

@app.get("/")
@app.get("/metrics")

def root():
    return {"msg": "Aegis of Alderaan Python Backend is running!"} 