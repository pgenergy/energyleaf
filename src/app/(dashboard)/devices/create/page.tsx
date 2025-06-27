import DeviceCreationForm from "@/components/forms/device/create-device-form";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
    title: "Geräte - Energyleaf",
};

export default function DeviceCreationPage() {
	return (
		<>
			<Breadcrumb className="mb-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/devices">Geräte</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Gerät erstellen</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<Card>
				<CardHeader>
					<CardTitle>Gerät erstellen</CardTitle>
					<CardDescription>Hier können Sie ein neues Gerät erstellen.</CardDescription>
				</CardHeader>
				<CardContent>
					<DeviceCreationForm />
				</CardContent>
			</Card>
		</>
	);
}
