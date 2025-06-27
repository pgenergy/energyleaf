import { DeviceOverview } from "@/components/cards/device/device-overview";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function DevicesPage() {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
			<div className="col-span-1 flex flex-row items-center justify-between md:col-span-3">
				<h1 className="text-xl font-bold">Ihre Geräte</h1>
				<Link href="/devices/create" className={buttonVariants({ variant: "default" })}>
					<PlusIcon />
					<span className="hidden md:block">Gerät hinzufügen</span>
				</Link>
			</div>
			<Suspense fallback={<Skeleton className="col-span-1 h-56 md:col-span-3" />}>
				<DeviceOverview />
			</Suspense>
		</div>
	);
}
