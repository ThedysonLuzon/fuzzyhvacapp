// frontend/src/api/agent.ts
export type HvacPowerResponse = {
  hvac_power: number;
  naive_hvac_power: number;
};

export type OptimizeIn = {
  lat: number;
  lon: number;
  comfort_low: number;
  comfort_high: number;
  occupancy: number[]; // 24 values
};

export type OptimizePlan = {
  hours: number[];
  setpoints: number[];
  outdoor: number[];
  occupancy: number[];
  power: number[];
};

export type OptimizeResponse =
  | { ok: true; plan: any }
  | { ok: false; error: string };

function baseUrl() {
  // Prefer dev proxy. If not using it, set VITE_BACKEND_URL=http://localhost:8000
  return (import.meta as any).env?.VITE_BACKEND_URL || "";
}

export async function getHvacPower(params: {
  indoor: number;
  occupancy: number;
  outdoor: number;
}): Promise<HvacPowerResponse> {
  const url = new URL("/api/hvac-power", baseUrl() || window.location.origin);
  url.searchParams.set("indoor", String(params.indoor));
  url.searchParams.set("occupancy", String(params.occupancy));
  url.searchParams.set("outdoor", String(params.outdoor));
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`hvac-power failed: ${r.status}`);
  return r.json();
}

export async function agentOptimize(payload: OptimizeIn): Promise<OptimizeResponse> {
  const r = await fetch((baseUrl() || "") + "/agent/optimize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    return { ok: false, error: `optimize failed: ${r.status} ${detail}` };
  }
  return r.json();
}

// Normalization helpers

export function tryParseJSON<T = any>(x: unknown): T | null {
  if (typeof x !== "string") return null;
  try {
    return JSON.parse(x) as T;
  } catch {
    return null;
  }
}

/** Accepts many shapes and tries to coerce into OptimizePlan, else returns a raw string for display. */
export function normalizePlan(anyPlan: any): { plan?: OptimizePlan; raw?: string } {
  let candidate: any = anyPlan;

  // If server wrapped it
  if (candidate?.plan !== undefined && candidate?.ok === true) candidate = candidate.plan;

  // If it's a string, try parse it
  if (typeof candidate === "string") {
    const parsed = tryParseJSON(candidate);
    if (parsed) candidate = parsed;
    else return { raw: candidate };
  }

  // Some crews return {output: "...json..."} or {result: "..."}
  if (typeof candidate?.output === "string") {
    const parsed = tryParseJSON(candidate.output);
    if (parsed) candidate = parsed;
  }
  if (typeof candidate?.result === "string") {
    const parsed = tryParseJSON(candidate.result);
    if (parsed) candidate = parsed;
  }

  const hasKeys =
    candidate &&
    Array.isArray(candidate.hours) &&
    Array.isArray(candidate.setpoints) &&
    Array.isArray(candidate.outdoor) &&
    Array.isArray(candidate.occupancy) &&
    Array.isArray(candidate.power);

  if (hasKeys) {
    return { plan: candidate as OptimizePlan };
  }

  return { raw: typeof candidate === "string" ? candidate : JSON.stringify(candidate, null, 2) };
}
