import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AdminSimulationToggleCard from "@/components/cards/settings/admin-simulation-toggle-card";
import AdminAccountStatusForm from "@/components/forms/admin/admin-account-status-form";
import AdminBatteryForm from "@/components/forms/admin/admin-battery-form";
import AdminEnergyTariffForm from "@/components/forms/admin/admin-energy-tariff-form";
import AdminEvForm from "@/components/forms/admin/admin-ev-form";
import AdminHeatPumpForm from "@/components/forms/admin/admin-heat-pump-form";
import AdminHintConfigForm from "@/components/forms/admin/admin-hint-config-form";
import AdminHouseholdForm from "@/components/forms/admin/admin-household-form";
import AdminSolarForm from "@/components/forms/admin/admin-solar-form";
import AdminTouTariffForm from "@/components/forms/admin/admin-tou-tariff-form";
import AdminUserInfoForm from "@/components/forms/admin/admin-user-info-form";
import AdminUserNameForm from "@/components/forms/admin/admin-user-name-form";
import AdminUserEditNav from "@/components/nav/admin-user-edit-nav";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { env } from "@/env";
import {
	ChargingSpeed,
	HeatPumpSource,
	HintStageType,
	HouseType,
	SimulationType,
	SolarOrientation,
	TariffType,
	TimeZoneType,
} from "@/lib/enums";
import { getCurrentSession } from "@/server/lib/auth";
import { getHintConfig } from "@/server/queries/hints";
import {
	getSimulationBatterySettings,
	getSimulationEvSettings,
	getSimulationHeatPumpSettings,
	getSimulationSolarSettings,
	getSimulationTouTariffSettings,
} from "@/server/queries/simulations";
import { getUserDataByUserId, getUserFullById } from "@/server/queries/user";

type Params = Promise<{ id: string }>;

interface Props {
	params: Params;
}

export const metadata: Metadata = {
	title: "Nutzer bearbeiten - Admin - Energyleaf",
};

async function UserEditHeader({ userId }: { userId: string }) {
	const user = await getUserFullById(userId);

	if (!user) {
		return <h1 className="text-xl font-semibold">Nutzer nicht gefunden</h1>;
	}

	const displayName = user.firstname || user.lastname ? `${user.firstname} ${user.lastname}`.trim() : user.username;

	return (
		<div className="flex flex-col gap-1">
			<h1 className="text-xl font-semibold">{displayName} - Bearbeiten</h1>
			<p className="text-muted-foreground text-sm">{user.email}</p>
		</div>
	);
}

async function UserNameCard({ userId }: { userId: string }) {
	const user = await getUserFullById(userId);

	if (!user) {
		return null;
	}

	return (
		<Card id="name">
			<CardHeader>
				<CardTitle>Name</CardTitle>
				<CardDescription>Vor- und Nachname des Benutzers</CardDescription>
			</CardHeader>
			<CardContent>
				<AdminUserNameForm
					userId={userId}
					initialValues={{
						firstname: user.firstname ?? "",
						lastname: user.lastname ?? "",
					}}
				/>
			</CardContent>
		</Card>
	);
}

async function UserContactCard({ userId }: { userId: string }) {
	const user = await getUserFullById(userId);

	if (!user) {
		return null;
	}

	return (
		<Card id="contact">
			<CardHeader>
				<CardTitle>Kontaktinformationen</CardTitle>
				<CardDescription>Telefon, Adresse und Zeitzone</CardDescription>
			</CardHeader>
			<CardContent>
				<AdminUserInfoForm
					userId={userId}
					initialValues={{
						phone: user.phone ?? "",
						address: user.address ?? "",
						timezone: (user.timezone as TimeZoneType) ?? TimeZoneType.Europe_Berlin,
					}}
				/>
			</CardContent>
		</Card>
	);
}

async function UserHouseholdCard({ userId }: { userId: string }) {
	const userData = await getUserDataByUserId(userId);

	return (
		<Card id="household">
			<CardHeader>
				<CardTitle>Haushalt</CardTitle>
				<CardDescription>Gebäudetyp, Wohnfläche und Haushaltsgröße</CardDescription>
			</CardHeader>
			<CardContent>
				<AdminHouseholdForm
					userId={userId}
					initialValues={{
						houseType: (userData?.property as HouseType) ?? HouseType.Apartement,
						livingSpace: userData?.livingSpace ?? 1,
						people: userData?.household ?? 1,
					}}
				/>
			</CardContent>
		</Card>
	);
}

async function UserEnergyCard({ userId }: { userId: string }) {
	const userData = await getUserDataByUserId(userId);

	return (
		<Card id="energy">
			<CardHeader>
				<CardTitle>Energietarif</CardTitle>
				<CardDescription>Tarifart und Preise</CardDescription>
			</CardHeader>
			<CardContent>
				<AdminEnergyTariffForm
					userId={userId}
					initialValues={{
						tariffType: (userData?.tariff as TariffType) ?? TariffType.Basic,
						basePrice: userData?.basePrice ?? 0.01,
						workingPrice: userData?.workingPrice ?? 0.01,
						monthlyPayment: userData?.monthlyPayment ?? 1,
					}}
				/>
			</CardContent>
		</Card>
	);
}

async function UserStatusCard({ userId }: { userId: string }) {
	const user = await getUserFullById(userId);

	if (!user) {
		return null;
	}

	return (
		<Card id="status">
			<CardHeader>
				<CardTitle>Kontostatus</CardTitle>
				<CardDescription>Berechtigungen und Statuseinstellungen</CardDescription>
			</CardHeader>
			<CardContent>
				<AdminAccountStatusForm
					userId={userId}
					initialValues={{
						isActive: user.isActive,
						isAdmin: user.isAdmin,
						isParticipant: user.isParticipant,
						isSimulationFree: user.isSimulationFree,
					}}
				/>
			</CardContent>
		</Card>
	);
}

async function UserHintConfigCard({ userId }: { userId: string }) {
	const config = await getHintConfig(userId);

	return (
		<Card id="hints">
			<CardHeader>
				<CardTitle>Hinweise</CardTitle>
				<CardDescription>Hinweis-Stufe und Einstellungen</CardDescription>
			</CardHeader>
			<CardContent>
				<AdminHintConfigForm
					userId={userId}
					initialValues={{
						stage: (config?.stage as HintStageType) ?? HintStageType.Simple,
						hintsEnabled: config?.hintsEnabled ?? true,
					}}
				/>
			</CardContent>
		</Card>
	);
}

async function UserEvSimulationCard({ userId }: { userId: string }) {
	const data = await getSimulationEvSettings(userId);

	return (
		<div id="simulation-ev" className="flex flex-col gap-4">
			<AdminSimulationToggleCard
				userId={userId}
				simulationType={SimulationType.EV}
				enabled={data?.enabled ?? false}
				configured={data !== null}
			/>
			<Card>
				<CardHeader>
					<CardTitle>E-Mobilität</CardTitle>
					<CardDescription>Konfigurieren Sie hier das Elektroauto für die Simulation.</CardDescription>
				</CardHeader>
				<CardContent>
					<AdminEvForm
						userId={userId}
						initialValues={{
							chargingSpeed: data?.chargingSpeed ?? ChargingSpeed.Eleven,
							evCapacityKwh: data?.evCapacityKwh ?? 40,
							dailyDrivingDistanceKm: data?.dailyDrivingDistanceKm ?? undefined,
							avgConsumptionPer100Km: data?.avgConsumptionPer100Km ?? undefined,
							defaultSchedule: data?.defaultSchedule ?? [{ start: "22:00", end: "06:00" }],
							weekdaySchedules: data?.weekdaySchedules ?? {},
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}

async function UserSolarSimulationCard({ userId }: { userId: string }) {
	const data = await getSimulationSolarSettings(userId);

	return (
		<div id="simulation-solar" className="flex flex-col gap-4">
			<AdminSimulationToggleCard
				userId={userId}
				simulationType={SimulationType.Solar}
				enabled={data?.enabled ?? false}
				configured={data !== null}
			/>
			<Card>
				<CardHeader>
					<CardTitle>Photovoltaik</CardTitle>
					<CardDescription>Konfigurieren Sie hier die Solaranlage für die Simulation.</CardDescription>
				</CardHeader>
				<CardContent>
					<AdminSolarForm
						userId={userId}
						initialValues={{
							peakPower: data?.peakPower ?? 10,
							orientation: data?.orientation ?? SolarOrientation.South,
							inverterPower: data?.inverterPower ?? 10,
							sunHoursPerDay: data?.sunHoursPerDay ?? undefined,
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}

async function UserHeatPumpSimulationCard({ userId }: { userId: string }) {
	const data = await getSimulationHeatPumpSettings(userId);

	return (
		<div id="simulation-heatpump" className="flex flex-col gap-4">
			<AdminSimulationToggleCard
				userId={userId}
				simulationType={SimulationType.HeatPump}
				enabled={data?.enabled ?? false}
				configured={data !== null}
			/>
			<Card>
				<CardHeader>
					<CardTitle>Wärmepumpe</CardTitle>
					<CardDescription>Konfigurieren Sie hier die Wärmepumpe für die Simulation.</CardDescription>
				</CardHeader>
				<CardContent>
					<AdminHeatPumpForm
						userId={userId}
						initialValues={{
							source: data?.source ?? HeatPumpSource.Probe,
							powerKw: data?.powerKw ?? 10,
							bufferLiter: data?.bufferLiter ?? 0,
							defaultSchedule: data?.defaultSchedule ?? [
								{ start: "06:00", end: "22:00", targetTemperature: 21 },
							],
							weekdaySchedules: data?.weekdaySchedules ?? {},
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}

async function UserBatterySimulationCard({ userId }: { userId: string }) {
	const data = await getSimulationBatterySettings(userId);

	return (
		<div id="simulation-battery" className="flex flex-col gap-4">
			<AdminSimulationToggleCard
				userId={userId}
				simulationType={SimulationType.Battery}
				enabled={data?.enabled ?? false}
				configured={data !== null}
			/>
			<Card>
				<CardHeader>
					<CardTitle>Batteriespeicher</CardTitle>
					<CardDescription>Konfigurieren Sie hier den Batteriespeicher für die Simulation.</CardDescription>
				</CardHeader>
				<CardContent>
					<AdminBatteryForm
						userId={userId}
						initialValues={{
							capacityKwh: data?.capacityKwh ?? 5,
							maxPowerKw: data?.maxPowerKw ?? 3,
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}

async function UserTouTariffSimulationCard({ userId }: { userId: string }) {
	const data = await getSimulationTouTariffSettings(userId);

	return (
		<div id="simulation-tou" className="flex flex-col gap-4">
			<AdminSimulationToggleCard
				userId={userId}
				simulationType={SimulationType.TOU}
				enabled={data?.enabled ?? false}
				configured={data !== null}
			/>
			<Card>
				<CardHeader>
					<CardTitle>Dynamischer Stromtarif</CardTitle>
					<CardDescription>Konfigurieren Sie hier den dynamischen Stromtarif (Time of Use).</CardDescription>
				</CardHeader>
				<CardContent>
					<AdminTouTariffForm
						userId={userId}
						initialValues={{
							pricingMode: data?.pricingMode ?? "tou",
							basePrice: data?.basePrice ?? 10,
							standardPrice: data?.standardPrice ?? 30,
							zones: data?.zones ?? [],
							weekdayZones: data?.weekdayZones ?? {},
							spotMarkup: data?.spotMarkup ?? 3,
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}

export default async function UserEditPage(props: Props) {
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

	const displayName =
		targetUser.firstname || targetUser.lastname
			? `${targetUser.firstname} ${targetUser.lastname}`.trim()
			: targetUser.username;

	return (
		<>
			<Breadcrumb className="mb-4">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/admin/users">Nutzer</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink href={`/admin/users/${userId}`}>{displayName}</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Bearbeiten</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<div className="flex flex-col gap-4">
				<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<Suspense fallback={<Skeleton className="h-12 w-48" />}>
						<UserEditHeader userId={userId} />
					</Suspense>
					<Button asChild variant="outline" size="sm">
						<Link href={`/admin/users/${userId}`}>Zurück zur Übersicht</Link>
					</Button>
				</div>

				<AdminUserEditNav />

				<div className="flex flex-col gap-6">
					<Suspense fallback={<Skeleton className="h-48" />}>
						<UserNameCard userId={userId} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-48" />}>
						<UserContactCard userId={userId} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-48" />}>
						<UserHouseholdCard userId={userId} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-48" />}>
						<UserEnergyCard userId={userId} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-48" />}>
						<UserStatusCard userId={userId} />
					</Suspense>

					{experimentMode && (
						<Suspense fallback={<Skeleton className="h-48" />}>
							<UserHintConfigCard userId={userId} />
						</Suspense>
					)}

					<Suspense fallback={<Skeleton className="h-48" />}>
						<UserEvSimulationCard userId={userId} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-48" />}>
						<UserSolarSimulationCard userId={userId} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-48" />}>
						<UserHeatPumpSimulationCard userId={userId} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-48" />}>
						<UserBatterySimulationCard userId={userId} />
					</Suspense>

					<Suspense fallback={<Skeleton className="h-48" />}>
						<UserTouTariffSimulationCard userId={userId} />
					</Suspense>
				</div>
			</div>
		</>
	);
}
