import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SensorCreationForm from "@/components/forms/sensor/create-sensor-form";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/server/lib/auth";

export const metadata: Metadata = {
	title: "Sensor erstellen - Admin - Energyleaf",
};

export default async function SensorCreationPage() {
	const { user } = await getCurrentSession();
	if (!user) {
		redirect("/login");
	}

	if (!user.isAdmin) {
		redirect("/dashboard");
	}

	return (
		<>
			<Breadcrumb className="mb-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/admin/sensors">Sensoren</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Sensor erstellen</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<Card>
				<CardHeader>
					<CardTitle>Sensor erstellen</CardTitle>
					<CardDescription>Hier können Sie einen neuen Sensor erstellen.</CardDescription>
				</CardHeader>
				<CardContent>
					<SensorCreationForm />
				</CardContent>
			</Card>
		</>
	);
}
