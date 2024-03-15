"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOutAction, signOutDemoAction } from "@/actions/auth";
import type { User } from "lucia";
import { LightbulbIcon, LogOutIcon, User2Icon } from "lucide-react";
import { toast } from "sonner";

import {
    Avatar,
    AvatarFallback,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@energyleaf/ui";

interface Props {
    user: User;
}

export default function NavbarAvatar({ user }: Props) {
    const [_isPending, startTransition] = useTransition();
    const router = useRouter();

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
                    <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel className="flex flex-col gap-1">
                    <p className="font-medium">Konto</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profile">
                        <User2Icon className="mr-2 h-4 w-4" />
                        Profil
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
