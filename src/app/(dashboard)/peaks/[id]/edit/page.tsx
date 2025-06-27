import PeaksEditCard from "@/components/cards/peaks/peaks-edit-card";
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
    title: "Ausschläge - Energyleaf",
};

export default async function PeakEditPage(props: Props) {
	const params = await props.params;

	return (
		<>
			<Breadcrumb className="mb-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/peaks">Ausschläge</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Geräte hinzufügen</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<Suspense fallback={<Skeleton className="h-56" />}>
				<PeaksEditCard id={params.id} />
			</Suspense>
		</>
	);
}
