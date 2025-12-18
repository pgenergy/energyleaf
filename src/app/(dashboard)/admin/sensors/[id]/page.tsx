import { PencilIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import SensorAdditionalUsersCard from "@/components/cards/sensor/sensor-additional-users-card";
import SensorInfoCard from "@/components/cards/sensor/sensor-info-card";
import SensorPrimaryUserCard from "@/components/cards/sensor/sensor-primary-user-card";
import SensorScriptCard from "@/components/cards/sensor/sensor-script-card";
import SensorTokenCard from "@/components/cards/sensor/sensor-token-card";
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
import { getCurrentSession } from "@/server/lib/auth";
import { getAdditionalUsersForSensor, getSensorByClientId, getSensorToken } from "@/server/queries/sensor";
import { getAllUsers, getUserById } from "@/server/queries/user";

type Params = Promise<{ id: string }>;

interface Props {
	params: Params;
}

export const metadata: Metadata = {
	title: "Sensordetails - Admin - Energyleaf",
};

async function SensorOverviewContent({ clientId }: { clientId: string }) {
	const sensor = await getSensorByClientId(clientId);
	if (!sensor) {
		redirect("/admin/sensors");
	}

	const [user, token, additionalUsers, allUsers] = await Promise.all([
		sensor.userId ? getUserById(sensor.userId) : null,
		sensor.version === 2 ? getSensorToken(sensor.id) : null,
		getAdditionalUsersForSensor(sensor.id),
		getAllUsers(),
	]);

	return (
		<div className="flex flex-col gap-6">
			{/* Header with Edit Button */}
			<div className="flex flex-row items-center justify-between">
				<h1 className="truncate font-mono text-xl font-semibold">{sensor.clientId}</h1>
				<Button asChild variant="outline" size="icon" className="cursor-pointer">
					<Link href={`/admin/sensors/${encodeURIComponent(sensor.clientId)}/edit`}>
						<PencilIcon className="size-4" />
					</Link>
				</Button>
			</div>

			{/* Grid Layout */}
			<div className="grid gap-4 md:grid-cols-2">
				<SensorInfoCard sensor={sensor} />
				<SensorTokenCard sensor={sensor} token={token} />
				<SensorPrimaryUserCard sensor={sensor} user={user} />
				<SensorAdditionalUsersCard sensor={sensor} additionalUsers={additionalUsers} allUsers={allUsers} />
			</div>

			{/* Script Card (full width) */}
			<SensorScriptCard sensor={sensor} />
		</div>
	);
}

export default async function SensorOverviewPage(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		redirect("/login");
	}

	if (!user.isAdmin) {
		redirect("/dashboard");
	}

	const params = await props.params;
	const clientId = decodeURIComponent(params.id);

	return (
		<>
			<Breadcrumb className="mb-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/admin/sensors">Sensoren</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Sensordetails</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<Suspense fallback={<Skeleton className="h-96" />}>
				<SensorOverviewContent clientId={clientId} />
			</Suspense>
		</>
	);
}
