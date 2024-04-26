const config = {
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: {
                    dark: "hsl(240 3.7% 15.9%)",
                    DEFAULT: "hsl(240 5.9% 90%)",
                },
                input: {
                    dark: "240 3.7% 15.9%",
                    DEFAULT: "hsl(240 5.9% 90%)",
                },
                ring: {
                    dark: "hsl(142.4 71.8% 29.2%)",
                    DEFAULT: "hsl(142.1 76.2% 36.3%)",
                },
                background: {
                    dark: "hsl(20 14.3% 4.1%)",
                    DEFAULT: "hsl(0 0% 100%)",
                },
                foreground: {
                    dark: "hsl(0 0% 95%)",
                    DEFAULT: "hsl(240 10% 3.9%)",
                },
                primary: {
                    dark: "hsl(147 39% 43%)",
                    "dark-foreground": "hsl(355.7 100% 97.3%)",
                    DEFAULT: "hsl(147 39% 43%)",
                    foreground: "hsl(355.7 100% 97.3%)",
                },
                secondary: {
                    dark: "hsl(240 3.7% 15.9%)",
                    "dark-foreground": "hsl(0 0% 98%)",
                    DEFAULT: "hsl(240 4.8% 95.9%)",
                    foreground: "hsl(240 5.9% 10%)",
                },
                destructive: {
                    dark: "hsl(0 62.8% 30.6%)",
                    "dark-foreground": "hsl(0 85.7% 97.3%)",
                    DEFAULT: "hsl(0 84.2% 60.2%)",
                    foreground: "hsl(0 0% 98%)",
                },
                muted: {
                    dark: "hsl(0 0% 15%)",
                    "dark-foreground": "hsl(240 5% 64.9%)",
                    DEFAULT: "hsl(240 4.8% 95.9%)",
                    foreground: "hsl(240 3.8% 46.1%)",
                },
                accent: {
                    dark: "hsl(12 6.5% 15.1%)",
                    darkForeground: "hsl(0 0% 98%)",
                    DEFAULT: "hsl(240 4.8% 95.9%)",
                    foreground: "hsl(240 5.9% 10%)",
                },
                popover: {
                    dark: "hsl(0 0% 9%)",
                    "dark-foreground": "hsl(0 0% 95%)",
                    DEFAULT: "hsl(0 0% 100%)",
                    foreground: "hsl(240 10% 3.9%)",
                },
                card: {
                    dark: "hsl(24 9.8% 10%)",
                    "dark-foreground": "hsl(0 0% 95%)",
                    DEFAULT: "hsl(0 0% 100%)",
                    foreground: "hsl(240 10% 3.9%)",
                },
            },
            borderRadius: {
                lg: "0.75rem",
                md: "calc(0.75rem - 2px)",
                sm: "calc(0.75rem - 4px)",
            },
            fontFamily: {
                sans: [
                    "ui-sans-serif",
                    "system-ui",
                    "sans-serif",
                    "Apple Color Emoji",
                    "Segoe UI Emoji",
                    "Segoe UI Symbol",
                    "Noto Color Emoji",
                ],
            },
        },
    },
};

export default config;
