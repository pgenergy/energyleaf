"use client";

import { demoLogoutAction, logoutAction } from "@/server/actions/auth";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon, LogOutIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { toast } from "sonner";
import { Collapsible, CollapsibleTrigger } from "../ui/collapsible";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSubButton,
	useSidebar,
} from "../ui/sidebar";

interface Props {
	userId: string;
	items: {
		slug: string;
		title: string;
		icon: React.ReactNode;
		path: string;
		admin?: boolean;
	}[];
}

export default function AppSidebar(props: Props) {
	const router = useRouter();
	const pathname = usePathname();
	const [pending, startTransition] = useTransition();
	const { open, setOpen } = useSidebar();

	const navLinks = useMemo(() => {
		return props.items.filter((item) => !item.admin);
	}, [props.items]);

	const adminLinks = useMemo(() => {
		return props.items.filter((item) => item.admin);
	}, [props.items]);

	function handleLogout() {
		startTransition(async () => {
			const toastId = toast.loading("Abmelden...", {
				duration: Infinity,
			});
			if (props.userId === "demo") {
				const res = await demoLogoutAction();
				if (!res.success) {
					toast.error(res.message, {
						id: toastId,
						duration: 4000,
					});
				} else if (res.path) {
					toast.success(res.message, {
						id: toastId,
						duration: 4000,
					});
					router.push(res.path);
				}
				return;
			}
			const res = await logoutAction();
			if (!res.success) {
				toast.error(res.message, {
					id: toastId,
					duration: 4000,
				});
			} else if (res.path) {
				toast.success(res.message, {
					id: toastId,
					duration: 4000,
				});
				router.push(res.path);
			}
		});
	}

	return (
		<Sidebar collapsible="icon" variant="inset">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/dashboard" prefetch>
								<Image alt="logo" className="size-8" height={499} src="/logo.png" width={499} />
								<span className="font-bold">Energyleaf</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						{navLinks.map((item) => (
							<SidebarMenuItem key={item.slug}>
								<SidebarMenuButton
									asChild
									isActive={pathname.startsWith(item.path)}
									tooltip={item.title}
									className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
								>
									<Link href={item.path}>
										{item.icon}
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
				{adminLinks.length > 0 ? (
					<Collapsible asChild defaultOpen={true} className="group/collapsible">
						<SidebarGroup>
							<SidebarGroupLabel asChild>
								<CollapsibleTrigger>
									Admin
									<ChevronDownIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
								</CollapsibleTrigger>
							</SidebarGroupLabel>
							<CollapsibleContent>
								<SidebarMenu>
									{adminLinks.map((item) => (
										<SidebarMenuItem key={item.slug}>
											<SidebarMenuSubButton
												asChild
												isActive={pathname === item.path}
												className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
											>
												<Link href={item.path}>
													{item.icon}
													<span>{item.title}</span>
												</Link>
											</SidebarMenuSubButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</CollapsibleContent>
						</SidebarGroup>
					</Collapsible>
				) : null}
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							tooltip={open ? "Einklappen" : "Ausklappen"}
							className="hidden md:flex"
						>
							<button
								className="cursor-pointer"
								onClick={() => {
									setOpen(!open);
								}}
							>
								{open ? (
									<>
										<ArrowLeftIcon />
										<span>Einklappen</span>
									</>
								) : (
									<>
										<ArrowRightIcon />
										<span>Ausklappen</span>
									</>
								)}
							</button>
						</SidebarMenuButton>
						<SidebarMenuButton asChild tooltip="Abmelden">
							<button className="cursor-pointer" onClick={() => (!pending ? handleLogout() : null)}>
								<LogOutIcon />
								<span>Abmelden</span>
							</button>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
