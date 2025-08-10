# backend/app/main.py

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from app.fuzzy_controller import build_controller_sim, naive_thermostat

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # allow all origins for now
    allow_methods=["GET"],
    allow_headers=["*"],
)

@app.get("/api/hvac-power")
def hvac_power(
    indoor: float = Query(..., ge=15, le=30),
    occupancy: float = Query(..., ge=0, le=100),
    outdoor: float = Query(..., ge=-10, le=45),
):
    fuzzy = build_controller_sim(indoor, occupancy, outdoor)
    naive = naive_thermostat(indoor)
    return {
        "hvac_power": fuzzy,
        "naive_hvac_power": naive
    }
