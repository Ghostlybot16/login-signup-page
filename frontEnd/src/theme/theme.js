import { createTheme } from "@mantine/core";

export const theme = createTheme({
    primaryColor: "dark",

    primaryShade: {
        light: 9,
        dark: 6,
    },

    defaultRadius: "md",

    cursorType: "pointer",

    fontFamily:
        'system-ui, -apple-system, "Segoe UI", sans-serif',

    headings: {
        fontFamily:
            'system-ui, -apple-system, "Segoe UI", sans-serif',
    },
});