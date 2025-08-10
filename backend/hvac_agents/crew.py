# backend/hvac_agents/crew.py
from __future__ import annotations
from typing import Any, Dict
import json
import os
import asyncio
import yaml

from crewai import Agent, Task, Crew

from .tools.hvac_tool import ComputeHVACTool
from .tools.hvac_batch_tool import ComputeHVACBatchTool
from .tools.weather_tool import get_weather_forecast

CFG_DIR = os.path.join(os.path.dirname(__file__), "config")

def _load_yaml(name: str) -> dict:
    path = os.path.join(CFG_DIR, name)
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def build_crew() -> Crew:
    agents_cfg = _load_yaml("agents.yaml")
    tasks_cfg = _load_yaml("tasks.yaml")

    planner = Agent(config=agents_cfg["planner"], verbose=True)
    optimizer = Agent(
        config=agents_cfg["optimizer"],
        tools=[ComputeHVACTool(), ComputeHVACBatchTool(), get_weather_forecast],
        verbose=True,
    )

    plan_task = Task(config=tasks_cfg["plan_task"], agent=planner)
    optimize_task = Task(config=tasks_cfg["optimize_task"], agent=optimizer)

    return Crew(agents=[planner, optimizer], tasks=[plan_task, optimize_task], verbose=True)

async def kickoff_async(inputs: Dict[str, Any]) -> str:
    """
    Run the crew with inputs and return the final string.
    Tries native kickoff_async; falls back to thread if not available.
    """
    crew = build_crew()
    # Try native async first
    if hasattr(crew, "kickoff_async"):
        return await crew.kickoff_async(inputs=inputs)  # type: ignore
    # Fallback: run blocking kickoff in a thread
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, lambda: crew.kickoff(inputs=inputs))
