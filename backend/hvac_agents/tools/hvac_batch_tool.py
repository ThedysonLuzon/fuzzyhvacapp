# backend/hvac_agents/tools/hvac_batch_tool.py
from typing import Type, List
from pydantic import BaseModel, Field
from crewai.tools import BaseTool
from app.fuzzy_controller import build_controller_sim

class BatchInputs(BaseModel):
    """24-hour batch inputs (arrays must be length 24)."""
    indoor: List[float] = Field(..., min_length=24, max_length=24, description="Hourly indoor °C (24)")
    occupancy: List[float] = Field(..., min_length=24, max_length=24, description="Hourly occupancy % (24)")
    outdoor: List[float] = Field(..., min_length=24, max_length=24, description="Hourly outdoor °C (24)")

class ComputeHVACBatchTool(BaseTool):
    """
    CrewAI Tool — Batch fuzzy HVAC oracle (24 hours).
    Returns a 24-length list of hvac_power values in [0..10].
    """
    name: str = "compute_hvac_power_batch"
    description: str = (
        "Return a list of 24 fuzzy HVAC power values (0..10) for hourly indoor/outdoor/occupancy arrays."
    )
    args_schema: Type[BatchInputs] = BatchInputs

    def _run(self, indoor: List[float], occupancy: List[float], outdoor: List[float]) -> List[float]:
        out: List[float] = []
        for i in range(24):
            _in = float(max(15.0, min(30.0, indoor[i])))
            _occ = float(max(0.0, min(100.0, occupancy[i])))
            _out = float(max(-10.0, min(45.0, outdoor[i])))
            p = build_controller_sim(_in, _occ, _out)
            out.append(float(max(0.0, min(10.0, round(float(p), 3)))))
        return out
