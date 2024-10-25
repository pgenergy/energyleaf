"use client";

import { signOutAction, signOutDemoAction } from "@/actions/auth";
import type { Versions } from "@energyleaf/lib/versioning";
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
import type { User } from "lucia";
import { BookOpenIcon, ChevronsLeftIcon, ChevronsRightIcon, LogOutIcon } from "lucide-react";
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
        appVersion?: Versions;
    }[];
    user: User;
    isDemo: boolean;
    handbookLink: string | null;
}

export default function AppSidebar(props: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const { toggleSidebar, isMobile, open } = useSidebar();

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
                    {!props.isDemo && props.handbookLink ? (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                className="hover:bg-accent hover:text-accent-foreground"
                                tooltip="Handbuch"
                            >
                                <a href={props.handbookLink} target="_blank" rel="noreferrer">
                                    <BookOpenIcon />
                                    <span>Handbuch</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ) : null}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={props.isDemo ? onDemoExit : onSignOut}
                            className="hover:bg-accent hover:text-accent-foreground"
                            tooltip="Abmelden"
                        >
                            <LogOutIcon />
                            <span>{props.isDemo ? "Demo beenden" : "Abmelden"}</span>
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
