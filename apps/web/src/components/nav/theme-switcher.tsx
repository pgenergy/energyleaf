"use client";

import { Button } from "@energyleaf/ui";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeSwitcher() {
    const theme = useTheme();
    const currentTheme = theme.theme;

    return (
        <Button onClick={() => { theme.setTheme(currentTheme === "dark" ? "light" : "dark"); }} size="icon" variant="ghost">
            {currentTheme === "dark" ? (
                <SunIcon className="h-4 w-4" />
            ) : (
                <MoonIcon className="h-4 w-4" />
            )}
        </Button>
    );
}
