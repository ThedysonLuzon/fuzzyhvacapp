// frontend/src/components/HVACControlPanel.tsx

import React, { useState } from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  HStack,
  Button,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
  Spinner,
  Tooltip,
  useToast,
  Box,
  Text,
} from "@chakra-ui/react";
import { InfoIcon, RepeatIcon } from "@chakra-ui/icons";
import useHVAC from "../hooks/useHVAC";

export default function HVACControlPanel() {
  const [indoor, setIndoor] = useState(22);
  const [occupancy, setOccupancy] = useState(50);
  const [outdoor, setOutdoor] = useState(20);

  const { power, naivePower, loading, error, fetchPower } = useHVAC();
  const toast = useToast();

  const onCompute = async () => {
    try {
      await fetchPower(indoor, occupancy, outdoor);
    } catch (err: any) {
      toast({
        title: "Computation Error",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const onReset = () => {
    setIndoor(22);
    setOccupancy(50);
    setOutdoor(20);
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Indoor Temp */}
      <FormControl>
        <FormLabel>
          Indoor Temp: {indoor}°C{" "}
          <Tooltip label="Room temperature in °C">
            <InfoIcon boxSize={4} />
          </Tooltip>
        </FormLabel>
        <Slider min={15} max={30} value={indoor} onChange={(v) => setIndoor(v)}>
          <SliderTrack bg="gray.200">
            <SliderFilledTrack bg="teal.400" />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>
      </FormControl>

      {/* Occupancy */}
      <FormControl>
        <FormLabel>
          Occupancy: {occupancy}%{" "}
          <Tooltip label="Percent of room occupied">
            <InfoIcon boxSize={4} />
          </Tooltip>
        </FormLabel>
        <Slider min={0} max={100} value={occupancy} onChange={(v) => setOccupancy(v)}>
          <SliderTrack bg="gray.200">
            <SliderFilledTrack bg="teal.400" />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>
      </FormControl>

      {/* Outdoor Temp */}
      <FormControl>
        <FormLabel>
          Outdoor Temp: {outdoor}°C{" "}
          <Tooltip label="Outside temperature in °C">
            <InfoIcon boxSize={4} />
          </Tooltip>
        </FormLabel>
        <Slider min={-10} max={45} value={outdoor} onChange={(v) => setOutdoor(v)}>
          <SliderTrack bg="gray.200">
            <SliderFilledTrack bg="teal.400" />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>
      </FormControl>

      {/* Actions */}
      <HStack spacing={4}>
        <Button colorScheme="teal" flex="1" onClick={onCompute} isLoading={loading}>
          Compute
        </Button>
        <IconButton aria-label="Reset" icon={<RepeatIcon />} onClick={onReset} />
      </HStack>

      {/* Results: Fuzzy vs Traditional */}
      <Box textAlign="center">
        {loading ? (
          <Spinner size="lg" />
        ) : error ? (
          <Text color="red.500">{error}</Text>
        ) : power !== null && naivePower !== null ? (
          <HStack spacing={8} justify="center">
            <Stat>
              <StatLabel>Fuzzy Power</StatLabel>
              <StatNumber>{power.toFixed(2)}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Traditional</StatLabel>
              <StatNumber>{naivePower.toFixed(2)}</StatNumber>
            </Stat>
          </HStack>
        ) : null}
      </Box>
    </VStack>
  );
}
