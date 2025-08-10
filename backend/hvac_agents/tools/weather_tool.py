# backend/hvac_agents/tools/weather_tool.py
from crewai.tools import tool
import httpx

@tool("get_weather_forecast")
def get_weather_forecast(lat: float, lon: float, hours: int = 24) -> dict:
    """
    Fetch next-24h hourly outdoor temperature (°C) via Open-Meteo (no API key).
    Returns {"times":[...], "temps":[...]} both length <= hours.
    """
    r = httpx.get(
        "https://api.open-meteo.com/v1/forecast",
        params={"latitude": lat, "longitude": lon, "hourly": "temperature_2m", "forecast_days": 1},
        timeout=10,
    )
    r.raise_for_status()
    j = r.json()
    return {"times": j["hourly"]["time"][:hours], "temps": j["hourly"]["temperature_2m"][:hours]}
