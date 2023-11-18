import type { Metadata } from "next";
import "@energyleaf/tailwindcss/global.css";

export const metadata: Metadata = {
    title: "Energyleaf Admin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="de">
            <body>{children}</body>
        </html>
    );
}
