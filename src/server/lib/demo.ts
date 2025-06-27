import { env } from "@/env";
import { ElectricityMeter, HouseType, TariffType, TimeZoneType, WaterType } from "@/lib/enums";
import { cookies } from "next/headers";
import { Device } from "../db/tables/device";
import { User, UserData } from "../db/tables/user";

export function getDemoUser(): User {
	return {
		id: "demo",
		password: "",
		isActive: true,
		isAdmin: false,
		isParticipant: true,
		onboardingCompleted: true,
		firstname: "Demo",
		lastname: "User",
		email: "demo@energyleaf.de",
		phone: "0123456789",
		address: "Demostraße 1",
		username: "Demo User",
		created: new Date(),
		deleted: false,
		timezone: TimeZoneType.Europe_Berlin,
		activationDate: new Date(),
	};
}

export async function getDemoUserData(): Promise<UserData> {
	const cookieStore = await cookies();
	const userData = cookieStore.get("user_data") ?? null;
	if (!userData) {
		return {
			id: "demo_id",
			userId: "demo",
			tariff: TariffType.Eco,
			household: 1,
			property: HouseType.House,
			livingSpace: 120,
			hotWater: WaterType.Electric,
			timestamp: new Date(),
			basePrice: 30,
			workingPrice: 0.34,
			consumptionGoal: 260,
			monthlyPayment: 200,
			electricityMeterNumber: "123456789",
			electricityMeterType: ElectricityMeter.Digital,
			electricityMeterImgUrl: null,
			wifiAtElectricityMeter: true,
			powerAtElectricityMeter: true,
			installationComment: null,
			devicePowerEstimationRSquared: null,
			currentEnergyThreshold: null,
		};
	}
	const userDataJson = JSON.parse(userData.value) as UserData;
	return userDataJson;
}

export async function updateDemoUserData(data: Partial<UserData>) {
	const cookieStore = await cookies();
	const userData = cookieStore.get("user_data") ?? null;
	if (!userData) {
		return;
	}
	const userDataJson = JSON.parse(userData.value) as UserData;
	const newUserData = {
		...userDataJson,
		...data,
	};
	cookieStore.set("user_data", JSON.stringify(newUserData), {
		httpOnly: true,
		sameSite: "lax",
		secure: env.VERCEL_ENV === "production",
		expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		path: "/",
	});
}

export async function addDemoDevice(device: Device) {
	const cookieStore = await cookies();
	const devices = cookieStore.get("devices") ?? null;
	if (!devices) {
		cookieStore.set("devices", JSON.stringify([device]), {
			httpOnly: true,
			sameSite: "lax",
			secure: env.VERCEL_ENV === "production",
			expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			path: "/",
		});
	} else {
		const devicesJson = JSON.parse(devices.value) as Device[];
		const count = devicesJson.length;
		const newDevice = {
			...device,
			id: `device_${count + 1}`,
		};
		devicesJson.push(newDevice);
		cookieStore.set("devices", JSON.stringify(devicesJson), {
			httpOnly: true,
			sameSite: "lax",
			secure: env.VERCEL_ENV === "production",
			expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			path: "/",
		});
	}
}

export async function updateDemoDevice(deviceId: string, newDevice: Device) {
	const cookieStore = await cookies();
	const devices = cookieStore.get("devices") ?? null;
	if (!devices) {
		return;
	}

	const devicesJson = JSON.parse(devices.value) as Device[];
	const newDevices = devicesJson.map((device) => {
		if (device.id === deviceId) {
			return {
				...newDevice,
				created: device.created,
				timestamp: new Date(),
				id: device.id,
			};
		}
		return device;
	});
	cookieStore.set("devices", JSON.stringify(newDevices), {
		httpOnly: true,
		sameSite: "lax",
		secure: env.VERCEL_ENV === "production",
		expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		path: "/",
	});
}

export async function deleteDemoDevice(deviceId: string) {
	const cookieStore = await cookies();
	const devices = cookieStore.get("devices") ?? null;
	if (!devices) {
		return;
	}

	const devicesJson = JSON.parse(devices.value) as Device[];
	const newDevices = devicesJson.filter((device) => device.id !== deviceId);
	cookieStore.set("devices", JSON.stringify(newDevices), {
		httpOnly: true,
		sameSite: "lax",
		secure: env.VERCEL_ENV === "production",
		expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		path: "/",
	});
}
