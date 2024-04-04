import type { Metadata } from "next";

import "@energyleaf/tailwindcss/global.css";

export const metadata: Metadata = {
    title: "Energyleaf Admin",
    robots: "noindex, nofollow",
};
export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="de" suppressHydrationWarning>
            <head />
            <body>{children}</body>
        </html>
    );
}
