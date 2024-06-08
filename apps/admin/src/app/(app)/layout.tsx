import QueryClientProvider from "@/hooks/query-provider";
import { ThemeProvider } from "@/hooks/theme/theme-provider";
import { Toaster } from "@energyleaf/ui/components/utils";

interface Props {
    children: React.ReactNode;
}

export default function AppLayout({ children }: Props) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
            <QueryClientProvider>{children}</QueryClientProvider>
            <Toaster richColors />
        </ThemeProvider>
    );
}
