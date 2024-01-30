"use client";

import { track } from "@vercel/analytics";
import { ComputerIcon, MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";
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

    function switchTheme(value: string) {
        theme.setTheme(value);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                    <SunMoonIcon className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Darstellung</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2"
                    onClick={() => {
                        track('switchTheme("system")');
                        switchTheme("system");
                    }}
                >
                    <ThemeIcon theme="system" />
                    System
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2"
                    onClick={() => {
                        track('switchTheme("light")');
                        switchTheme("light");
                    }}
                >
                    <ThemeIcon theme="light" />
                    Hell
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2"
                    onClick={() => {
                        track('switchTheme("dark")');
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
