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
                border: "hsl(240 5.9% 90%)",
                input: "hsl(240 5.9% 90%)",
                ring: "hsl(142.1 76.2% 36.3%)",
                background: "hsl(0 0% 100%)",
                foreground: "hsl(240 10% 3.9%)",
                primary: {
                    DEFAULT: "hsl(147 39% 43%)",
                    foreground: "hsl(355.7 100% 97.3%)",
                },
                secondary: {
                    DEFAULT: "hsl(240 4.8% 95.9%)",
                    foreground: "hsl(240 5.9% 10%)",
                },
                destructive: {
                    DEFAULT: "hsl(0 84.2% 60.2%)",
                    foreground: "hsl(0 0% 98%)",
                },
                muted: {
                    DEFAULT: "hsl(240 4.8% 95.9%)",
                    foreground: "hsl(240 3.8% 46.1%)",
                },
                accent: {
                    DEFAULT: "hsl(240 4.8% 95.9%)",
                    foreground: "hsl(240 5.9% 10%)",
                },
                popover: {
                    DEFAULT: "hsl(0 0% 100%)",
                    foreground: "hsl(240 10% 3.9%)",
                },
                card: {
                    DEFAULT: "hsl(0 0% 100%)",
                    foreground: "hsl(240 10% 3.9%)",
                },
            },
            borderRadius: {
                lg: `0.75rem`,
                md: `calc(0.75rem - 2px)`,
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
