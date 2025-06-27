import { ThemeProvider } from "@/components/provider/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "@/style/global.css";
import QueryProvider from "@/components/provider/query-provider";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="de" suppressHydrationWarning>
			<body className="antialiased">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<QueryProvider>{children}</QueryProvider>
					<Toaster richColors />
				</ThemeProvider>
			</body>
		</html>
	);
}
