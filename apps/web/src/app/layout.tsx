import { env, getUrl } from "@/env.mjs";
import { ThemeProvider } from "@/hooks/theme-provider";
import "@energyleaf/tailwindcss/global.css";
import QueryClientProvider from "@/hooks/query-client-provider";
import { Toaster } from "@energyleaf/ui/components/utils";
import type { Metadata } from "next";

const description =
    "Mit diesem Tool können Sie Ihren Stromverbrauch übersichtlich darstellen und besser verstehen. Analysieren Sie Ihren Verbrauch, finden Sie Einsparpotenziale und senken Sie Ihre Kosten.";

export const metadata: Metadata = {
    title: "Energyleaf",
    description,
    keywords:
        "Stromverbrauch, Energieverbrauch, Universität Oldenburg, Nachhaltigkeit, Energiesparen, Visualisierung, Analyse, Einsparpotenzial, Kosten senken",
    openGraph: {
        title: "Energyleaf",
        description,
        type: "website",
        locale: "de_DE",
        url: getUrl(env),
    },
};
export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
    return (
        <html lang="de" suppressHydrationWarning>
            <head />
            <body>
                <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
                    <QueryClientProvider>{children}</QueryClientProvider>
                    <Toaster richColors />
                </ThemeProvider>
            </body>
        </html>
    );
}
