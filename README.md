# Fuzzy HVAC App — Agentic Planner + Fuzzy Controller

[![FastAPI](https://img.shields.io/badge/API-FastAPI-05998B.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB.svg)](https://react.dev/)
[![Chakra UI](https://img.shields.io/badge/UI-Chakra%20UI-3CC7C3.svg)](https://chakra-ui.com/)
[![CrewAI](https://img.shields.io/badge/Agents-CrewAI-6E59F7.svg)](https://docs.crewai.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

A demo HVAC system that **plans** a 24-hour temperature schedule with an agentic layer (CrewAI) and evaluates it using a **fuzzy controller** (scikit-fuzzy).  
Backend: **FastAPI** · Frontend: **React + Chakra UI**.

---

## Overview

- **Fuzzy controller** outputs **HVAC power** `0..10` from *(indoor/occupancy/outdoor)*.
- **Agentic planner (CrewAI)** proposes hourly **setpoints** within a comfort band using weather + occupancy.
- **Weather** via Open-Meteo (no API key).
- **UI** includes:
  - **HVAC Controller** card (probe baseline `/api/hvac-power`),
  - **Agent Optimizer** card (plan setpoints → evaluate power).

> **Clarification:** In this demo, **Planned Setpoint °C** is a *target* the agent proposes. It’s not a live sensor. We feed it to the fuzzy oracle for planning. For closed-loop control, wire a measured/predicted indoor temp.

---

## Project Structure
```

└── fuzzy-hvac-app/
    ├── backend/
    │   ├── requirements.txt
    │   ├── app/
    │   │   ├── __init__.py
    │   │   ├── api_agent.py
    │   │   ├── fuzzy_controller.py
    │   │   ├── main.py
    │   │   └── __pycache__/
    │   └── hvac_agents/
    │       ├── __init__.py
    │       ├── crew.py
    │       ├── __pycache__/
    │       ├── config/
    │       │   ├── agents.yaml
    │       │   └── tasks.yaml
    │       └── tools/
    │           ├── hvac_batch_tool.py
    │           ├── hvac_tool.py
    │           ├── weather_tool.py
    │           └── __pycache__/
    └── frontend/
        ├── README.md
        ├── eslint.config.js
        ├── index.html
        ├── package-lock.json
        ├── package.json
        ├── tsconfig.app.json
        ├── tsconfig.json
        ├── tsconfig.node.json
        ├── vite.config.ts
        ├── .gitignore
        ├── public/
        └── src/
            ├── App.css
            ├── App.tsx
            ├── index.css
            ├── main.tsx
            ├── theme.ts
            ├── vite-env.d.ts
            ├── api/
            │   └── agent.ts
            ├── assets/
            ├── components/
            │   ├── AgentOptimizer.tsx
            │   └── HVACControlPanel.tsx
            └── hooks/
                └── useHVAC.ts

```
---

## Requirements

- **Python** 3.11+ (tested on 3.12)
- **Node** 18+
- **OPENAI_API_KEY** (or compatible) for CrewAI planning

---

## Quick Start

### 1) Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -U pip
pip install fastapi uvicorn scikit-fuzzy crewai httpx pydantic pyyaml python-dotenv

# Required for /agent/optimize
echo "OPENAI_API_KEY=sk-..." > .env

uvicorn app.main:app --reload
# → http://localhost:8000
```

### 2) Frontend
```bash
cd ../frontend
npm install

npm run dev
# → http://localhost:5173

```

### API
`GET /api/hvac-power` \
Params: `indoor` (15–30 °C), `occupancy` (0–100%), `outdoor` (−10–45 °C) \
Returns: fuzzy `hvac_power` (0..10) + `naive_hvac_power` (0 or 10)
```bash
curl "http://localhost:8000/api/hvac-power?indoor=22&occupancy=50&outdoor=20"
```
`POST /agent/optimize`
Runs planner → fetches forecast → computes 24h fuzzy power.
```json
// Body
{
  "lat": 43.7,
  "lon": -79.4,
  "comfort_low": 21,
  "comfort_high": 24,
  "occupancy": [50,50,...(24 values)...,50]
}
```
Response(ideal)
```json
{
  "ok": true,
  "plan": {
    "hours": [0,1,...,23],
    "setpoints": [ ...24 ],
    "outdoor":   [ ...24 ],
    "occupancy": [ ...24 ],
    "power":     [ ...24 ]
  }
}
```