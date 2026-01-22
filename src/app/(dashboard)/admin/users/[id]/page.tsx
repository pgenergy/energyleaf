import { endOfMonth, format, startOfMonth } from "date-fns";
import { de } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { PencilIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AnalyticsActionsCard from "@/components/cards/analytics/analytics-actions-card";
import AnalyticsOverviewCard from "@/components/cards/analytics/analytics-overview-card";
import AnalyticsPageViewsCard from "@/components/cards/analytics/analytics-pageviews-card";
import AnalyticsTopActionsCard from "@/components/cards/analytics/analytics-top-actions-card";
import AnalyticsTopPagesCard from "@/components/cards/analytics/analytics-top-pages-card";
import UserAccountCard from "@/components/cards/user/user-account-card";
import UserDevicesCard from "@/components/cards/user/user-devices-card";
import UserEnergyCard from "@/components/cards/user/user-energy-card";
import UserEnergyChartCard from "@/components/cards/user/user-energy-chart-card";
import UserExperimentCard from "@/components/cards/user/user-experiment-card";
import UserHintConfigCard from "@/components/cards/user/user-hint-config-card";
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
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getEnergySensorIdForUser } from "@/server/queries/sensor";
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

function SectionHeader({ title, description }: { title: string; description?: string }) {
	return (
		<div className="flex flex-col gap-1">
			<h2 className="text-lg font-semibold">{title}</h2>
			{description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
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

	const timezone = (targetUser.timezone as TimeZoneType | null) ?? TimeZoneType.Europe_Berlin;
	const tz = TimezoneTypeToTimeZone[timezone];
	const baseDate = toZonedTime(new Date(), tz);
	const start = startOfMonth(baseDate);
	const end = endOfMonth(baseDate);
	const rangeLabel = `${format(start, "PPP", { locale: de })} - ${format(end, "PPP", { locale: de })}`;
	const energySensorId = await getEnergySensorIdForUser(userId);

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

			<div className="flex flex-col gap-8">
				<Suspense fallback={<Skeleton className="h-8 w-48" />}>
					<UserDetailHeader userId={userId} />
				</Suspense>

				<section className="flex flex-col gap-4">
					<SectionHeader title="Profil" description="Kontodaten und Berechtigungen." />
					<Suspense
						fallback={
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<Skeleton className="h-48" />
								<Skeleton className="h-48" />
							</div>
						}
					>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<UserInfoCard userId={userId} />
							<UserAccountCard userId={userId} experimentMode={experimentMode} />
						</div>
					</Suspense>
				</section>

				<section className="flex flex-col gap-4">
					<SectionHeader title="Haushalt & Tarif" description="Haushaltsdaten und Energietarif." />
					<Suspense
						fallback={
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<Skeleton className="h-48" />
								<Skeleton className="h-48" />
							</div>
						}
					>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<UserHouseholdCard userId={userId} />
							<UserEnergyCard userId={userId} />
						</div>
					</Suspense>
				</section>

				{energySensorId && (
					<section className="flex flex-col gap-4">
						<SectionHeader title="Energieverbrauch" description="Tagesverlauf des aktuellen Verbrauchs." />
						<Suspense fallback={<Skeleton className="h-96" />}>
							<UserEnergyChartCard
								userId={userId}
								timezone={targetUser.timezone as TimeZoneType | null}
							/>
						</Suspense>
					</section>
				)}

				<section className="flex flex-col gap-4">
					<SectionHeader
						title="Analytics"
						description={`Seitenaufrufe und Aktionen im Zeitraum ${rangeLabel}.`}
					/>
					<Suspense
						fallback={
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<Skeleton className="col-span-1 h-48 md:col-span-2" />
								<Skeleton className="col-span-1 h-96 md:col-span-2" />
								<Skeleton className="col-span-1 h-96 md:col-span-2" />
								<Skeleton className="col-span-1 h-80" />
								<Skeleton className="col-span-1 h-80" />
							</div>
						}
					>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<AnalyticsOverviewCard
								className="col-span-1 md:col-span-2"
								start={start}
								end={end}
								rangeLabel={rangeLabel}
								userId={userId}
							/>
							<AnalyticsPageViewsCard
								className="col-span-1 md:col-span-2"
								start={start}
								end={end}
								rangeLabel={rangeLabel}
								userId={userId}
							/>
							<AnalyticsActionsCard
								className="col-span-1 md:col-span-2"
								start={start}
								end={end}
								rangeLabel={rangeLabel}
								userId={userId}
							/>
							<AnalyticsTopPagesCard start={start} end={end} rangeLabel={rangeLabel} userId={userId} />
							<AnalyticsTopActionsCard start={start} end={end} rangeLabel={rangeLabel} userId={userId} />
						</div>
					</Suspense>
				</section>

				<section className="flex flex-col gap-4">
					<SectionHeader title="Sensoren & Geräte" description="Verknüpfte Sensoren und Geräte." />
					<Suspense
						fallback={
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<Skeleton className="h-48" />
								<Skeleton className="h-48" />
							</div>
						}
					>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<UserSensorCard userId={userId} />
							<UserDevicesCard userId={userId} />
						</div>
					</Suspense>
				</section>

				{experimentMode && (
					<section className="flex flex-col gap-4">
						<SectionHeader title="Experiment" description="Experiment- und Hinweisstatus." />
						<Suspense
							fallback={
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<Skeleton className="h-48" />
									<Skeleton className="h-48" />
								</div>
							}
						>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<UserHintConfigCard userId={userId} />
								<UserExperimentCard userId={userId} />
							</div>
						</Suspense>
					</section>
				)}
			</div>
		</>
	);
}
