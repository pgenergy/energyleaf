"use client";

import { ComputerIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@energyleaf/ui";

export default function ThemeSwitcher() {
    const theme = useTheme();
    const currentTheme = theme.theme;

    function switchTheme(value: string) {
        theme.setTheme(value);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                    <ThemeIcon theme={currentTheme || "system"} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Darstellung</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                        switchTheme("system");
                    }}
                >
                    <ThemeIcon theme="system" />
                    System
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                        switchTheme("light");
                    }}
                >
                    <ThemeIcon theme="light" />
                    Hell
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                        switchTheme("dark");
                    }}
                >
                    <ThemeIcon theme="dark" />
                    Dunkel
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function ThemeIcon({ theme }: { theme: string }) {
    if (theme === "dark") return <MoonIcon className="h-4 w-4" />;
    if (theme === "light") return <SunIcon className="h-4 w-4" />;

    return <ComputerIcon className="h-4 w-4" />;
}
