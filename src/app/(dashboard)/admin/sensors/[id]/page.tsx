import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import SensorOverviewCard from "@/components/cards/sensor/sensor-overview-card";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentSession } from "@/server/lib/auth";
import { getSensorByClientId, getSensorToken } from "@/server/queries/sensor";
import { getUserById } from "@/server/queries/user";

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

	const [user, token] = await Promise.all([
		sensor.userId ? getUserById(sensor.userId) : null,
		sensor.version === 2 ? getSensorToken(sensor.id) : null,
	]);

	return <SensorOverviewCard sensor={sensor} user={user} token={token} />;
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
