// frontend/src/theme.ts

import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: true,
  },
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
  },
  colors: {
    brand: {
      50: "#e3f9ff",
      100: "#c5eefd",
      200: "#a1dffd",
      300: "#7bcbfc",
      400: "#54b7fa",
      500: "#349ae1",
      600: "#2672b2",
      700: "#1b4c7a",
      800: "#112a49",
      900: "#091527",
    },
  },
});

export default theme;
