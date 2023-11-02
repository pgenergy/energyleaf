import "@energyleaf/tailwindcss/global.css";

import type { Metadata } from "next";

export const runtime = "edge";
export const metadata: Metadata = {
    title: "Energyleaf",
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
    return (
        <html lang="de">
            <head />
            <body>{children}</body>
        </html>
    );
}
