"use client";

import { Button } from "@energyleaf/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@energyleaf/ui/dropdown-menu";
import { ComputerIcon, MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeSwitcher() {
    const theme = useTheme();

    function switchTheme(value: string) {
        theme.setTheme(value);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="hidden md:flex">
                    <SunMoonIcon className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Darstellung</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2"
                    onClick={() => {
                        switchTheme("system");
                    }}
                >
                    <ThemeIcon theme="system" />
                    System
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2"
                    onClick={() => {
                        switchTheme("light");
                    }}
                >
                    <ThemeIcon theme="light" />
                    Hell
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2"
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
