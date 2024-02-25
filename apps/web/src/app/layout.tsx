import { ThemeProvider } from "@/hooks/theme-provider";

import "@energyleaf/tailwindcss/global.css";

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

import { Toaster } from "@energyleaf/ui/components/utils";

export const metadata: Metadata = {
    title: "Energyleaf",
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
