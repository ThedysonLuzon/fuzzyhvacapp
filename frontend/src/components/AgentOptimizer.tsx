// frontend/src/components/AgentOptimizer.tsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Heading,
  Input,
  SimpleGrid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Textarea,
  Alert,
  AlertIcon,
  useColorModeValue,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { agentOptimize, getHvacPower, normalizePlan } from "../api/agent";
import type { OptimizePlan } from "../api/agent";

function defaultOccupancy(): number[] {
  return [20,20,20,20,25,40,60,80,80,80,70,60,60,60,60,60,70,80,70,50,40,30,25,20];
}

export default function AgentOptimizer() {
  const [lat, setLat] = useState(43.7);
  const [lon, setLon] = useState(-79.4);
  const [comfortLow, setComfortLow] = useState(21);
  const [comfortHigh, setComfortHigh] = useState(24);
  const [occupancy, setOccupancy] = useState<number[]>(defaultOccupancy());

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<OptimizePlan | null>(null);
  const [raw, setRaw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const occupancyStr = useMemo(() => occupancy.join(","), [occupancy]);
  const cardBg = useColorModeValue("white", "gray.700");
  const accent = useColorModeValue("teal.600", "teal.300");
  const borderCol = useColorModeValue("gray.200", "gray.600");

  function updateOccupancyStr(s: string) {
    const nums = s
      .split(/[,\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => Number(t));
    if (nums.length === 24 && nums.every((n) => Number.isFinite(n))) {
      setOccupancy(nums.map((n) => Math.max(0, Math.min(100, n))));
    }
  }

  async function quickProbe() {
    setError(null);
    try {
      const j = await getHvacPower({ indoor: 22, occupancy: 50, outdoor: 20 });
      alert(`Probe ok:\nFuzzy=${j.hvac_power.toFixed(3)}  Naive=${j.naive_hvac_power.toFixed(1)}`);
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  async function runAgent() {
    setLoading(true);
    setError(null);
    setPlan(null);
    setRaw(null);
    try {
      const res = await agentOptimize({
        lat,
        lon,
        comfort_low: comfortLow,
        comfort_high: comfortHigh,
        occupancy,
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        // Normalize many possible shapes into {plan | raw}
        const out = normalizePlan(res.plan);
        if (out.plan) setPlan(out.plan);
        if (out.raw) setRaw(out.raw);
        console.debug("Agent response (normalized):", out);
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="lg" boxShadow="md">
      <CardHeader>
        <Heading size="md" color={accent} textAlign="center">
          Agent Optimizer (CrewAI)
        </Heading>
        <Text mt={2} fontSize="sm" textAlign="center" color={useColorModeValue("gray.600","gray.300")}>
          Generates a 24-hour schedule using your fuzzy controller as the oracle.
        </Text>
      </CardHeader>
      <CardBody>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
          <FormControl>
            <FormLabel>Latitude</FormLabel>
            <Input type="number" value={lat} onChange={(e) => setLat(Number(e.target.value))} />
          </FormControl>
          <FormControl>
            <FormLabel>Longitude</FormLabel>
            <Input type="number" value={lon} onChange={(e) => setLon(Number(e.target.value))} />
          </FormControl>
          <FormControl>
            <FormLabel>Comfort Low (°C)</FormLabel>
            <Input type="number" value={comfortLow} onChange={(e) => setComfortLow(Number(e.target.value))} />
          </FormControl>
          <FormControl>
            <FormLabel>Comfort High (°C)</FormLabel>
            <Input type="number" value={comfortHigh} onChange={(e) => setComfortHigh(Number(e.target.value))} />
          </FormControl>
        </SimpleGrid>

        <FormControl mb={3}>
          <HStack justify="space-between" align="baseline">
            <FormLabel mb={1}>Occupancy 24h (comma-separated %, length = 24)</FormLabel>
            <HStack spacing={2}>
              <Button size="sm" variant="outline" onClick={() => setOccupancy(defaultOccupancy())}>
                Reset demo
              </Button>
              <Tooltip label="Random 24 values in [0..100]">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setOccupancy(Array.from({ length: 24 }, () => Math.floor(Math.random() * 101)))}
                >
                  Randomize
                </Button>
              </Tooltip>
            </HStack>
          </HStack>
          <Textarea
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            value={occupancyStr}
            onChange={(e) => updateOccupancyStr(e.target.value)}
            rows={2}
          />
        </FormControl>

        <HStack spacing={3} mb={4}>
          <Button variant="outline" onClick={quickProbe}>
            Probe /api/hvac-power
          </Button>
          <Button colorScheme="teal" onClick={runAgent} isLoading={loading}>
            Run Agent Optimization
          </Button>
        </HStack>

        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        {raw && (
          <Box mb={4}>
            <Text fontWeight={700} mb={2}>
              Agent output (raw)
            </Text>
            <Box
              as="pre"
              p={4}
              borderRadius="md"
              bg={useColorModeValue("gray.900", "gray.800")}
              color="gray.100"
              overflowX="auto"
            >
              {raw}
            </Box>
          </Box>
        )}

        {plan && (
          <>
            <Divider my={4} />
            <Heading size="sm" mb={2}>
              Schedule (24h)
            </Heading>
            <TableContainer border="1px solid" borderColor={borderCol} borderRadius="md">
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Hr</Th>
                    <Th>Setpoint °C</Th>
                    <Th>Outdoor °C</Th>
                    <Th>Occupancy %</Th>
                    <Th>Fuzzy Power (0..10)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {plan.hours.map((h, i) => (
                    <Tr key={h}>
                      <Td>{h}</Td>
                      <Td>{Number.isFinite(plan.setpoints[i]) ? plan.setpoints[i].toFixed(1) : plan.setpoints[i]}</Td>
                      <Td>{Number.isFinite(plan.outdoor[i]) ? plan.outdoor[i].toFixed(1) : plan.outdoor[i]}</Td>
                      <Td>{plan.occupancy[i]}</Td>
                      <Td>{Number.isFinite(plan.power[i]) ? plan.power[i].toFixed(3) : plan.power[i]}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </>
        )}
      </CardBody>
    </Card>
  );
}
