import { PencilIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import UserAccountCard from "@/components/cards/user/user-account-card";
import UserDevicesCard from "@/components/cards/user/user-devices-card";
import UserEnergyCard from "@/components/cards/user/user-energy-card";
import UserExperimentCard from "@/components/cards/user/user-experiment-card";
import UserHouseholdCard from "@/components/cards/user/user-household-card";
import UserInfoCard from "@/components/cards/user/user-info-card";
import UserSensorCard from "@/components/cards/user/user-sensor-card";
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

type Params = Promise<{ id: string }>;

interface Props {
	params: Params;
}

export const metadata: Metadata = {
	title: "Nutzerdetails - Admin - Energyleaf",
};

async function UserDetailHeader({ userId }: { userId: string }) {
	const user = await getUserFullById(userId);

	if (!user) {
		return <h1 className="text-xl font-semibold">Nutzer nicht gefunden</h1>;
	}

	const displayName = user.firstname || user.lastname ? `${user.firstname} ${user.lastname}`.trim() : user.username;

	return (
		<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
			<h1 className="text-xl font-semibold">{displayName}</h1>
			<Button asChild variant="outline" size="sm">
				<Link href={`/admin/users/${userId}/edit`}>
					<PencilIcon className="mr-2 size-4" />
					Bearbeiten
				</Link>
			</Button>
		</div>
	);
}

export default async function UserDetailPage(props: Props) {
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

	return (
		<>
			<Breadcrumb className="mb-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/admin/users">Nutzer</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Nutzerdetails</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<div className="flex flex-col gap-4">
				<Suspense fallback={<Skeleton className="h-8 w-48" />}>
					<UserDetailHeader userId={userId} />
				</Suspense>

				<Suspense fallback={<Skeleton className="h-48" />}>
					<UserInfoCard userId={userId} />
				</Suspense>

				<Suspense fallback={<Skeleton className="h-48" />}>
					<UserAccountCard userId={userId} experimentMode={experimentMode} />
				</Suspense>

				<Suspense fallback={<Skeleton className="h-48" />}>
					<UserHouseholdCard userId={userId} />
				</Suspense>

				<Suspense fallback={<Skeleton className="h-48" />}>
					<UserEnergyCard userId={userId} />
				</Suspense>

				<Suspense fallback={<Skeleton className="h-48" />}>
					<UserSensorCard userId={userId} />
				</Suspense>

				<Suspense fallback={<Skeleton className="h-48" />}>
					<UserDevicesCard userId={userId} />
				</Suspense>

				{experimentMode && (
					<Suspense fallback={<Skeleton className="h-48" />}>
						<UserExperimentCard userId={userId} />
					</Suspense>
				)}
			</div>
		</>
	);
}
