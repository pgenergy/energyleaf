"use client";

import { signOutAction, signOutDemoAction } from "@/actions/auth";
import { Avatar as BAvatar } from "@boringer-avatars/react";
import { Avatar } from "@energyleaf/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@energyleaf/ui/dropdown-menu";
import type { User } from "lucia";
import {
    BookOpenIcon,
    ComputerIcon,
    LightbulbIcon,
    LogOutIcon,
    MoonIcon,
    SettingsIcon,
    SunIcon,
    SunMoonIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

interface Props {
    user: User;
    guide: string | null;
}

export default function NavbarAvatar({ user, guide }: Props) {
    const [_isPending, startTransition] = useTransition();
    const router = useRouter();
    const theme = useTheme();

    function switchTheme(value: string) {
        theme.setTheme(value);
    }

    function onDemoExit() {
        startTransition(() => {
            toast.promise(signOutDemoAction, {
                loading: "Beenden...",
                success: () => {
                    router.push("/");
                    return "Demo beendet.";
                },
                error: "Fehler beim Beenden.",
            });
        });
    }

    function onSignOut() {
        startTransition(() => {
            toast.promise(signOutAction, {
                loading: "Abmelden...",
                success: () => {
                    router.push("/");
                    return "Erfolgreich abgemeldet.";
                },
                error: "Fehler beim Abmelden.",
            });
        });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                    <BAvatar
                        size={40}
                        variant="beam"
                        name={user.id}
                        colors={["#FFAD08", "#EDD75A", "#73B06F", "#0C8F8F", "#405059"]}
                    />
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel className="flex flex-col gap-1">
                    <p className="font-medium">Konto</p>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/settings">
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        Einstellungen
                    </Link>
                </DropdownMenuItem>
                {user.id !== "demo" ? (
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/faq">
                            <LightbulbIcon className="mr-2 h-4 w-4" />
                            FAQ
                        </Link>
                    </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                {guide ? (
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={guide}>
                            <BookOpenIcon className="mr-2 h-4 w-4" />
                            Handbuch
                        </Link>
                    </DropdownMenuItem>
                ) : null}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <SunMoonIcon className="mr-2 h-4 w-4" />
                        Darstellung
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => switchTheme("light")}>
                            <SunIcon className="mr-2 h-4 w-4" />
                            Hell
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => switchTheme("dark")}>
                            <MoonIcon className="mr-2 h-4 w-4" />
                            Dunkel
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => switchTheme("system")}>
                            <ComputerIcon className="mr-2 h-4 w-4" />
                            System
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                {user.id === "demo" ? (
                    <DropdownMenuItem className="cursor-pointer text-destructive" onClick={onDemoExit}>
                        <LogOutIcon className="mr-2 h-4 w-4" />
                        Demo beenden
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem className="cursor-pointer text-destructive" onClick={onSignOut}>
                        <LogOutIcon className="mr-2 h-4 w-4" />
                        Abmelden
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
