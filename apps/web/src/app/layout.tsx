import { ThemeProvider } from "@/hooks/theme-provider";
import "@energyleaf/tailwindcss/global.css";
import { Toaster } from "@energyleaf/ui/components";

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Energyleaf",
};
export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
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
