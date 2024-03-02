"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/actions/auth";
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
import type { User } from "lucia";

interface Props {
    user: User;
}

export default function NavbarAvatar({ user }: Props) {
    const [_isPending, startTransition] = useTransition();
    const router = useRouter();

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
                    <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel className="flex flex-col gap-1">
                    <p className="font-medium">Konto</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.id !== "-1" ? (
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/profile">
                            <User2Icon className="mr-2 h-4 w-4" />
                            Profil
                        </Link>
                    </DropdownMenuItem>
                ) : null}
                {user.id !== "-1" ? (
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/faq">
                            <LightbulbIcon className="mr-2 h-4 w-4" />
                            FAQ
                        </Link>
                    </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive" onClick={onSignOut}>
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    {user.id === "-1" ? "Demo beenden" : "Abmelden"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
