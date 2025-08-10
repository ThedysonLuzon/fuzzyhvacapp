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
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import HVACControlPanel from "./components/HVACControlPanel";

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

      {/* MAIN CARD */}
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
