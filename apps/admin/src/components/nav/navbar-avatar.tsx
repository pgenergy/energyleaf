"use client";

import { signOutAction } from "@/actions/auth";
import { Avatar as BAvatar } from "@boringer-avatars/react";
import type { DefaultActionReturn } from "@energyleaf/lib";
import { Avatar } from "@energyleaf/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@energyleaf/ui/dropdown-menu";
import type { User } from "lucia";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

interface Props {
    user: User;
}

export default function NavbarAvatar({ user }: Props) {
    const [_isPending, startTransition] = useTransition();
    const router = useRouter();

    async function signOutActionCallback() {
        let res: DefaultActionReturn = undefined;
        try {
            res = await signOutAction();
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function onSignOut() {
        startTransition(() => {
            toast.promise(signOutActionCallback, {
                loading: "Abmelden...",
                success: () => {
                    router.push("/");
                    return "Erfolgreich abgemeldet.";
                },
                error: (err: Error) => err.message,
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
                <DropdownMenuItem className="cursor-pointer text-destructive" onClick={onSignOut}>
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Abmelden
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
