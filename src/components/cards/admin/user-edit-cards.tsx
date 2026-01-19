import AdminSimulationToggleCard from "@/components/cards/settings/admin-simulation-toggle-card";
import AdminAccountStatusForm from "@/components/forms/admin/admin-account-status-form";
import AdminBatteryForm from "@/components/forms/admin/admin-battery-form";
import AdminEnergyTariffForm from "@/components/forms/admin/admin-energy-tariff-form";
import AdminEvForm from "@/components/forms/admin/admin-ev-form";
import AdminExperimentForm from "@/components/forms/admin/admin-experiment-form";
import AdminHeatPumpForm from "@/components/forms/admin/admin-heat-pump-form";
import AdminHintConfigForm from "@/components/forms/admin/admin-hint-config-form";
import AdminHouseholdForm from "@/components/forms/admin/admin-household-form";
import AdminSolarForm from "@/components/forms/admin/admin-solar-form";
import AdminTouTariffForm from "@/components/forms/admin/admin-tou-tariff-form";
import AdminUserInfoForm from "@/components/forms/admin/admin-user-info-form";
import AdminUserNameForm from "@/components/forms/admin/admin-user-name-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ChargingSpeed,
	type ExperimentPhase,
	HeatPumpSource,
	HintStageType,
	HouseType,
	SimulationType,
	SolarOrientation,
	TariffType,
	TimeZoneType,
} from "@/lib/enums";
import { getHintConfig } from "@/server/queries/hints";
import {
	getSimulationBatterySettings,
	getSimulationEvSettings,
	getSimulationHeatPumpSettings,
	getSimulationSolarSettings,
	getSimulationTouTariffSettings,
} from "@/server/queries/simulations";
import { getUserDataByUserId, getUserExperimentDataByUserId, getUserFullById } from "@/server/queries/user";

interface Props {
	userId: string;
}

export async function UserNameCard({ userId }: Props) {
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

export async function UserContactCard({ userId }: Props) {
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

export async function UserHouseholdCard({ userId }: Props) {
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

export async function UserEnergyCard({ userId }: Props) {
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

export async function UserStatusCard({ userId }: Props) {
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

export async function UserHintConfigCard({ userId }: Props) {
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

export async function UserExperimentCard({ userId }: Props) {
	const experimentData = await getUserExperimentDataByUserId(userId);

	return (
		<Card id="experiment">
			<CardHeader>
				<CardTitle>Experiment</CardTitle>
				<CardDescription>Experimentdaten und Status</CardDescription>
			</CardHeader>
			<CardContent>
				<AdminExperimentForm
					userId={userId}
					initialValues={{
						experimentStatus: (experimentData?.experimentStatus as ExperimentPhase) ?? null,
						experimentNumber: experimentData?.experimentNumber ?? null,
						installationDate: experimentData?.installationDate
							? experimentData.installationDate.toISOString()
							: null,
						deinstallationDate: experimentData?.deinstallationDate
							? experimentData.deinstallationDate.toISOString()
							: null,
						getsPaid: experimentData?.getsPaid ?? false,
						usesProlific: experimentData?.usesProlific ?? false,
					}}
				/>
			</CardContent>
		</Card>
	);
}

export async function UserEvSimulationCard({ userId }: Props) {
	const data = await getSimulationEvSettings(userId);

	return (
		<Card id="simulation-ev">
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
	);
}

export async function UserSolarSimulationCard({ userId }: Props) {
	const data = await getSimulationSolarSettings(userId);

	return (
		<Card id="simulation-solar">
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
	);
}

export async function UserHeatPumpSimulationCard({ userId }: Props) {
	const data = await getSimulationHeatPumpSettings(userId);

	return (
		<Card id="simulation-heatpump">
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
	);
}

export async function UserBatterySimulationCard({ userId }: Props) {
	const data = await getSimulationBatterySettings(userId);

	return (
		<Card id="simulation-battery">
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
	);
}

export async function UserTouTariffSimulationCard({ userId }: Props) {
	const data = await getSimulationTouTariffSettings(userId);

	return (
		<Card id="simulation-tou">
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
	);
}

export async function UserEvSimulationToggleCard({ userId }: Props) {
	const data = await getSimulationEvSettings(userId);

	return (
		<AdminSimulationToggleCard
			userId={userId}
			simulationType={SimulationType.EV}
			enabled={data?.enabled ?? false}
			configured={data !== null}
		/>
	);
}

export async function UserSolarSimulationToggleCard({ userId }: Props) {
	const data = await getSimulationSolarSettings(userId);

	return (
		<AdminSimulationToggleCard
			userId={userId}
			simulationType={SimulationType.Solar}
			enabled={data?.enabled ?? false}
			configured={data !== null}
		/>
	);
}

export async function UserHeatPumpSimulationToggleCard({ userId }: Props) {
	const data = await getSimulationHeatPumpSettings(userId);

	return (
		<AdminSimulationToggleCard
			userId={userId}
			simulationType={SimulationType.HeatPump}
			enabled={data?.enabled ?? false}
			configured={data !== null}
		/>
	);
}

export async function UserBatterySimulationToggleCard({ userId }: Props) {
	const data = await getSimulationBatterySettings(userId);

	return (
		<AdminSimulationToggleCard
			userId={userId}
			simulationType={SimulationType.Battery}
			enabled={data?.enabled ?? false}
			configured={data !== null}
		/>
	);
}

export async function UserTouTariffSimulationToggleCard({ userId }: Props) {
	const data = await getSimulationTouTariffSettings(userId);

	return (
		<AdminSimulationToggleCard
			userId={userId}
			simulationType={SimulationType.TOU}
			enabled={data?.enabled ?? false}
			configured={data !== null}
		/>
	);
}
