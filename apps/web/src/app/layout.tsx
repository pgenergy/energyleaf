import { ThemeProvider } from "@/hooks/theme-provider";

import "@energyleaf/tailwindcss/global.css";

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

import { Toaster } from "@energyleaf/ui/components/utils";

export const metadata: Metadata = {
    title: "Energyleaf",
    description:
        "Mit diesem Tool können Sie Ihren Stromverbrauch übersichtlich darstellen und besser verstehen. Analysieren Sie Ihren Verbrauch, finden Sie Einsparpotenziale und senken Sie Ihre Kosten.",
    keywords:
        "Stromverbrauch, Energieverbrauch, Universität Oldenburg, Nachhaltigkeit, Energiesparen, Visualisierung, Analyse, Einsparpotenzial, Kosten senken",
    openGraph: {
        title: "Energyleaf",
        description:
            "Mit diesem Tool können Sie Ihren Stromverbrauch übersichtlich darstellen und besser verstehen. Analysieren Sie Ihren Verbrauch, finden Sie Einsparpotenziale und senken Sie Ihre Kosten.",
        type: "website",
        locale: "de_DE",
        url: "https://energyleaf.de",
    },
};
export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
    return (
        <html lang="de" suppressHydrationWarning>
            <head />
            <body>
                <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
                    {children}
                    <Toaster richColors />
                </ThemeProvider>
                <Analytics />
            </body>
        </html>
    );
}
