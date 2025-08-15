import DeviceEditCard from "@/components/cards/device/device-edit-card";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

type Params = Promise<{ id: string }>;

interface Props {
	params: Params;
}

export const metadata = {
	title: "Geräte - Energyleaf",
};

export default async function DeviceEditPage(props: Props) {
	const params = await props.params;

	return (
		<>
			<Breadcrumb className="mb-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/devices">Geräte</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Gerät bearbeiten</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<Suspense fallback={<Skeleton className="h-56" />}>
				<DeviceEditCard id={params.id} />
			</Suspense>
		</>
	);
}
