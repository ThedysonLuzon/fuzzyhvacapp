# backend/app/api_agent.py
from __future__ import annotations
from typing import List
import json
import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from hvac_agents.crew import kickoff_async

router = APIRouter(prefix="/agent", tags=["agent"])

class OptimizeIn(BaseModel):
    lat: float
    lon: float
    comfort_low: float = Field(21.0, ge=16, le=26)
    comfort_high: float = Field(24.0, ge=16, le=28)
    # 24 hourly occupancy percentages
    occupancy: List[float] = Field(..., min_length=24, max_length=24)

@router.post("/optimize")
async def optimize(payload: OptimizeIn):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="Missing OPENAI_API_KEY in environment")
    try:
        result = await kickoff_async(inputs=payload.model_dump())
        try:
            data = json.loads(str(result))
        except Exception:
            data = {"raw": str(result)}
        return {"ok": True, "plan": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
