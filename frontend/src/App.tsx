// frontend/src/App.tsx
import React from "react";
import {
  Box,
  Flex,
  Heading,
  Center,
  Container,
  Text,
  HStack,
  IconButton,
  useColorMode,
  Divider,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import HVACControlPanel from "./components/HVACControlPanel";
import AgentOptimizer from "./components/AgentOptimizer"; 

export default function App() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box bg="gray.100" _dark={{ bg: "gray.800" }} minH="100vh">
      {/* HEADER */}
      <Flex
        as="header"
        bg="teal.500"
        _dark={{ bg: "teal.700" }}
        color="white"
        p={4}
        align="center"
        justify="space-between"
      >
        <Heading size="md">Fuzzy HVAC Comfort</Heading>
        <HStack spacing={2}>
          <IconButton
            aria-label="Toggle dark mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            color="current"
          />
        </HStack>
      </Flex>

      {/* MAIN: Controller card */}
      <Center py={10}>
        <Container
          bg="white"
          _dark={{ bg: "gray.700" }}
          p={8}
          borderRadius="lg"
          boxShadow="md"
          maxW="lg"
        >
          <Heading
            as="h1"
            size="lg"
            mb={6}
            textAlign="center"
            color="teal.600"
            _dark={{ color: "teal.300" }}
          >
            HVAC Controller
          </Heading>
          <HVACControlPanel />
        </Container>
      </Center>

      {/* DIVIDER */}
      <Container maxW="6xl" px={6}>
        <Divider borderColor="gray.300" _dark={{ borderColor: "gray.600" }} />
      </Container>

      {/* AGENT: CrewAI optimizer section */}
      <Center py={10}>
        <Container maxW="6xl" px={6}>
          <Heading
            as="h2"
            size="lg"
            mb={3}
            color="teal.600"
            _dark={{ color: "teal.300" }}
            textAlign="center"
          >
            Agent Optimizer (CrewAI)
          </Heading>
          <Text
            fontSize="sm"
            color="gray.600"
            _dark={{ color: "gray.300" }}
            textAlign="center"
            mb={6}
          >
            Generates a 24-hour schedule using your fuzzy controller as the oracle. Probe the basic
            endpoint, then run optimization.
          </Text>

          {/* AgentOptimizer renders its own white card; */}
          <Box>
            <AgentOptimizer />
          </Box>
        </Container>
      </Center>

      {/* FOOTER */}
      <Flex
        as="footer"
        bg="teal.600"
        _dark={{ bg: "teal.800" }}
        color="white"
        py={3}
        justify="center"
      >
        <Text fontSize="sm">© 2025 Thedyson Luzon</Text>
      </Flex>
    </Box>
  );
}
