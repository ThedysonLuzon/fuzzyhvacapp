# backend/hvac_agents/tools/hvac_tool.py
from typing import Type
from pydantic import BaseModel, Field
from crewai.tools import BaseTool

# Uses your existing one-shot simulator
from app.fuzzy_controller import build_controller_sim

class HVACInputs(BaseModel):
    """Validated inputs for the fuzzy HVAC oracle."""
    indoor: float = Field(..., ge=15, le=30, description="Indoor temperature (°C)")
    occupancy: float = Field(..., ge=0, le=100, description="Occupancy percentage (0..100)")
    outdoor: float = Field(..., ge=-10, le=45, description="Outdoor temperature (°C)")

class ComputeHVACTool(BaseTool):
    """
    CrewAI Tool — Ground-truth fuzzy HVAC oracle.

    Given (indoor °C, occupancy %, outdoor °C), return hvac_power in [0..10].
    Calls your build_controller_sim(), which constructs a fresh simulation per call.
    """
    name: str = "compute_hvac_power"
    description: str = (
        "Return fuzzy HVAC power (0..10) for indoor °C, occupancy %, and outdoor °C. "
        "This is the ground-truth controller; respect physical bounds."
    )
    args_schema: Type[HVACInputs] = HVACInputs

    def _run(self, indoor: float, occupancy: float, outdoor: float) -> float:
        # Defensive clamping (mirrors FastAPI query constraints)
        indoor = float(max(15.0, min(30.0, indoor)))
        occupancy = float(max(0.0, min(100.0, occupancy)))
        outdoor = float(max(-10.0, min(45.0, outdoor)))

        power = build_controller_sim(indoor, occupancy, outdoor)
        return float(max(0.0, min(10.0, round(float(power), 3))))
