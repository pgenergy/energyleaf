"use client";

import { signOutAction } from "@/actions/auth";
import type { UserSelectType as User } from "@energyleaf/postgres/types";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    useSidebar,
} from "@energyleaf/ui/sidebar";
import { ChevronsLeftIcon, ChevronsRightIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition } from "react";
import { toast } from "sonner";

interface Props {
    links: {
        slug: string;
        title: string;
        path: string;
        icon: React.ReactNode;
    }[];
    user: User;
}

export default function AppSidebar(props: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const { toggleSidebar, isMobile, open } = useSidebar();

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
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {props.links.map((l) => (
                            <SidebarMenuItem key={l.slug}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname === l.path}
                                    tooltip={l.title}
                                    className="hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                                >
                                    <Link href={l.path}>
                                        {l.icon}
                                        <span>{l.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={onSignOut}
                            className="hover:bg-accent hover:text-accent-foreground"
                            tooltip="Abmelden"
                        >
                            <LogOutIcon />
                            <span>{"Abmelden"}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarSeparator />
                    <SidebarSeparator />
                    {!isMobile ? (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={toggleSidebar}
                                className="hover:bg-accent hover:text-accent-foreground"
                                tooltip={open ? "Einklappen" : "Ausklappen"}
                            >
                                {open ? <ChevronsLeftIcon /> : <ChevronsRightIcon />}
                                <span>Einklappen</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ) : null}
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
