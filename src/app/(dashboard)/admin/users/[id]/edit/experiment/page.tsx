import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { UserExperimentCard } from "@/components/cards/admin/user-edit-cards";
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
import { Skeleton } from "@/components/ui/skeleton";
import { env } from "@/env";
import { getCurrentSession } from "@/server/lib/auth";
import { getUserFullById } from "@/server/queries/user";

export const metadata: Metadata = {
	title: "Experiment bearbeiten - Admin - Energyleaf",
};

type Params = Promise<{ id: string }>;

interface Props {
	params: Params;
}

async function UserEditHeader({ userId }: { userId: string }) {
	const user = await getUserFullById(userId);

	if (!user) {
		return <h1 className="text-xl font-semibold">Nutzer nicht gefunden</h1>;
	}

	const displayName = user.firstname || user.lastname ? `${user.firstname} ${user.lastname}`.trim() : user.username;

	return (
		<div className="flex flex-col gap-1">
			<h1 className="text-xl font-semibold">{displayName} - Experiment</h1>
			<p className="text-muted-foreground text-sm">{user.email}</p>
		</div>
	);
}

export default async function UserEditExperimentPage(props: Props) {
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
						<BreadcrumbLink href={`/admin/users/${userId}/edit`}>Bearbeiten</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Experiment</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<div className="flex flex-col gap-4">
				<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<Suspense fallback={<Skeleton className="h-12 w-48" />}>
						<UserEditHeader userId={userId} />
					</Suspense>
					<Button asChild variant="outline" size="sm">
						<Link href={`/admin/users/${userId}/edit`}>Zurück zur Übersicht</Link>
					</Button>
				</div>

				<AdminUserEditNav userId={userId} showExperiment={experimentMode} />

				{experimentMode ? (
					<div className="flex flex-col gap-6">
						<Suspense fallback={<Skeleton className="h-48" />}>
							<UserExperimentCard userId={userId} />
						</Suspense>
					</div>
				) : (
					<p className="text-muted-foreground text-sm">Experimentmodus ist deaktiviert.</p>
				)}
			</div>
		</>
	);
}
