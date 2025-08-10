// frontend/src/hooks/useHVAC.ts

import { useState } from "react";
import axios from "axios";

export default function useHVAC() {
  const [power, setPower] = useState<number | null>(null);
  const [naivePower, setNaivePower] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPower = async (indoor: number, occupancy: number, outdoor: number) => {
    setLoading(true);
    setError(null);

    try {
      const resp = await axios.get("/api/hvac-power", {
        baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8000",
        params: { indoor, occupancy, outdoor },
      });
      setPower(resp.data.hvac_power);
      setNaivePower(resp.data.naive_hvac_power);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { power, naivePower, loading, error, fetchPower };
}
