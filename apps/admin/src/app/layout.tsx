import type { Metadata } from "next";

import "@energyleaf/tailwindcss/global.css";

import { ThemeProvider } from "@/hooks/theme/theme-provider";

import { Toaster } from "@energyleaf/ui/components";

export const metadata: Metadata = {
    title: "Energyleaf Admin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="de">
            <head />
            <body>
                <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
                    {children}
                    <Toaster richColors />
                </ThemeProvider>
            </body>
        </html>
    );
}
