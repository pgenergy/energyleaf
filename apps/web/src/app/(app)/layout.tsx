import { ThemeProvider } from "@/hooks/theme-provider";

import { Toaster } from "@energyleaf/ui/components";

export const revalidate = 0;

export default function RootAppLayout({ children }: { children: React.ReactNode }): JSX.Element {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
            {children}
            <Toaster richColors />
        </ThemeProvider>
    );
}
