import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import SensorEditCard from "@/components/cards/sensor/sensor-edit-card";
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

type Params = Promise<{ id: string }>;

interface Props {
	params: Params;
}

export const metadata: Metadata = {
	title: "Sensor bearbeiten - Admin - Energyleaf",
};

export default async function SensorEditPage(props: Props) {
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
						<BreadcrumbPage>Sensor bearbeiten</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<Suspense fallback={<Skeleton className="h-56" />}>
				<SensorEditCard clientId={clientId} />
			</Suspense>
		</>
	);
}
