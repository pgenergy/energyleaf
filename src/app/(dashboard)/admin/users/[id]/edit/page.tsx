import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
	UserBatterySimulationToggleCard,
	UserEvSimulationToggleCard,
	UserHeatPumpSimulationToggleCard,
	UserSolarSimulationToggleCard,
	UserStatusCard as UserStatusToggleCard,
	UserTouTariffSimulationToggleCard,
} from "@/components/cards/admin/user-edit-cards";
import AdminUserEditNav from "@/components/nav/admin-user-edit-nav";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { env } from "@/env";
import { getCurrentSession } from "@/server/lib/auth";
import { getUserFullById } from "@/server/queries/user";

type Params = Promise<{ id: string }>;

interface Props {
	params: Params;
}

export const metadata: Metadata = {
	title: "Nutzer bearbeiten - Admin - Energyleaf",
};

async function UserEditHeader({ userId }: { userId: string }) {
	const user = await getUserFullById(userId);

	if (!user) {
		return <h1 className="text-xl font-semibold">Nutzer nicht gefunden</h1>;
	}

	const displayName = user.firstname || user.lastname ? `${user.firstname} ${user.lastname}`.trim() : user.username;

	return (
		<div className="flex flex-col gap-1">
			<h1 className="text-xl font-semibold">{displayName} - Bearbeiten</h1>
			<p className="text-muted-foreground text-sm">{user.email}</p>
		</div>
	);
}

export default async function UserEditPage(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		redirect("/login");
	}

	if (!user.isAdmin) {
		redirect("/dashboard");
	}

	const params = await props.params;
	const userId = params.id;
	const experimentMode = !env.DISABLE_EXPERIMENT;

	// Check if user exists
	const targetUser = await getUserFullById(userId);
	if (!targetUser) {
		redirect("/admin/users");
	}

	const displayName =
		targetUser.firstname || targetUser.lastname
			? `${targetUser.firstname} ${targetUser.lastname}`.trim()
			: targetUser.username;

	return (
		<>
			<Breadcrumb className="mb-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/admin/users">Nutzer</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink href={`/admin/users/${userId}`}>{displayName}</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Bearbeiten</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<div className="flex flex-col gap-4">
				<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<Suspense fallback={<Skeleton className="h-12 w-48" />}>
						<UserEditHeader userId={userId} />
					</Suspense>
					<Button asChild variant="outline" size="sm">
						<Link href={`/admin/users/${userId}`}>Zurück zur Übersicht</Link>
					</Button>
				</div>

				<AdminUserEditNav userId={userId} showExperiment={experimentMode} />

				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Schnellzugriff</CardTitle>
							<CardDescription>Direkt zu den jeweiligen Einstellungen.</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
								<Button asChild variant="outline" size="sm">
									<Link href={`/admin/users/${userId}/edit/profile`}>Profil</Link>
								</Button>
								<Button asChild variant="outline" size="sm">
									<Link href={`/admin/users/${userId}/edit/household`}>Haushalt</Link>
								</Button>
								<Button asChild variant="outline" size="sm">
									<Link href={`/admin/users/${userId}/edit/tariff`}>Tarif</Link>
								</Button>
								{experimentMode ? (
									<Button asChild variant="outline" size="sm">
										<Link href={`/admin/users/${userId}/edit/status`}>Hinweise</Link>
									</Button>
								) : null}
								<Button asChild variant="outline" size="sm">
									<Link href={`/admin/users/${userId}/edit/simulations`}>Simulationen</Link>
								</Button>
								{experimentMode ? (
									<Button asChild variant="outline" size="sm">
										<Link href={`/admin/users/${userId}/edit/experiment`}>Experiment</Link>
									</Button>
								) : null}
							</div>
						</CardContent>
					</Card>

					<Suspense fallback={<Skeleton className="h-48" />}>
						<UserStatusToggleCard userId={userId} />
					</Suspense>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Suspense fallback={<Skeleton className="h-32" />}>
							<UserEvSimulationToggleCard userId={userId} />
						</Suspense>
						<Suspense fallback={<Skeleton className="h-32" />}>
							<UserSolarSimulationToggleCard userId={userId} />
						</Suspense>
						<Suspense fallback={<Skeleton className="h-32" />}>
							<UserHeatPumpSimulationToggleCard userId={userId} />
						</Suspense>
						<Suspense fallback={<Skeleton className="h-32" />}>
							<UserBatterySimulationToggleCard userId={userId} />
						</Suspense>
						<Suspense fallback={<Skeleton className="h-32" />}>
							<UserTouTariffSimulationToggleCard userId={userId} />
						</Suspense>
					</div>
				</div>
			</div>
		</>
	);
}
