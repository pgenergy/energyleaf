import { Versions } from "@energyleaf/lib/versioning";
import { db, genId } from "@energyleaf/postgres";
import { createDevices, saveDeviceSuggestionsToPeakDb } from "@energyleaf/postgres/query/device";
import { findAndMark, getSequencesBySensor } from "@energyleaf/postgres/query/peaks";
import { createUser, getUserByMail, setUserActive, updateUser } from "@energyleaf/postgres/query/user";
import { sensorDataTable, sensorTable } from "@energyleaf/postgres/schema/sensor";
import { DeviceCategory, DeviceCategoryTitles, SensorType } from "@energyleaf/postgres/types";
import { eq, max, min } from "drizzle-orm";
import { Argon2id } from "oslo/password";
import { insertEnergyData } from "./insert-energy-data";

export async function addLiveDemoData() {
    const userMail = "team@energyleaf.de";

    const existingUser = await getUserByMail(userMail);
    if (existingUser) {
        console.log("User already exists. Skipping initialization.");
        return;
    }

    const hash = await new Argon2id().hash("energyleaf");
    const userId = await createUser({
        email: userMail,
        address: "Ammerländer Heerstraße 114-118, Oldenburg",
        electricityMeterNumber: "1234567890",
        electricityMeterType: "digital",
        firstname: "Max",
        lastname: "Mustermann",
        hasPower: true,
        password: hash,
        hasWifi: true,
        participation: true,
        username: "Energyleaf-Live-Demo",
    });

    await setUserActive(userId, true, new Date());
    await updateUser(
        {
            appVersion: Versions.support,
        },
        userId,
    );

    const sensorId = genId(35);
    await db.insert(sensorTable).values({
        userId,
        sensorType: SensorType.Electricity,
        clientId: "00-80-41-ae-fd-7e",
        id: sensorId,
    });

    await insertEnergyData([sensorId]);

    const { minDate, maxDate } = (
        await db
            .select({ minDate: min(sensorDataTable.timestamp), maxDate: max(sensorDataTable.timestamp) })
            .from(sensorDataTable)
            .where(eq(sensorDataTable.sensorId, sensorId))
    )[0];
    minDate?.setDate(minDate.getDate() + 2);
    const intervals = splitInto30MinIntervals(minDate || new Date(2000, 0, 1), maxDate || new Date());
    for (const interval of intervals) {
        await findAndMark({
            start: interval[0],
            end: interval[1],
            sensorId,
            type: "peak",
        });
    }

    const deviceCategories = [
        DeviceCategory.Fridge,
        DeviceCategory.Freezer,
        DeviceCategory.Microwave,
        DeviceCategory.ECar,
        DeviceCategory.CoffeeMachine,
    ];
    const devices = deviceCategories.map((category) => ({
        name: DeviceCategoryTitles[category],
        userId,
        category,
    }));
    devices.push({
        name: "E-Auto 2",
        category: DeviceCategory.ECar,
        userId,
    });
    await createDevices(devices);

    const mlCreatedDevices = [DeviceCategory.Dishwasher, DeviceCategory.WashingMachine];
    const mlSupportDevices = [
        DeviceCategory.Fridge,
        DeviceCategory.Freezer,
        DeviceCategory.Microwave,
        DeviceCategory.Dishwasher,
        DeviceCategory.WashingMachine,
    ];
    const sequences = await getSequencesBySensor(sensorId);
    const lastSequence = sequences[sequences.length - 1];
    await saveDeviceSuggestionsToPeakDb(lastSequence.id, [mlCreatedDevices[0], DeviceCategory.Fridge]);
    const secondLastSequence = sequences[sequences.length - 2];
    await saveDeviceSuggestionsToPeakDb(secondLastSequence.id, [mlCreatedDevices[1], DeviceCategory.Freezer]);
    for (let i = 0; i < sequences.length - 2; i++) {
        const randomMlSupportedDevices = mlSupportDevices
            .sort(() => Math.random() - 0.5)
            .filter(() => Math.random() > 0.5);
        if (randomMlSupportedDevices.length > 0) {
            await saveDeviceSuggestionsToPeakDb(sequences[i].id, randomMlSupportedDevices);
        }
    }

    console.log("Live demo data successfully added.");
}

function splitInto30MinIntervals(startDate: Date, endDate: Date): [Date, Date][] {
    const intervals: [Date, Date][] = [];
    const currentDate = new Date(startDate);

    while (currentDate < endDate) {
        const intervalStart = new Date(currentDate);
        currentDate.setMinutes(currentDate.getMinutes() + 30);
        const intervalEnd = new Date(currentDate);

        // Ensure the interval end does not exceed the final end date
        if (intervalEnd > endDate) {
            intervals.push([intervalStart, new Date(endDate)]);
        } else {
            intervals.push([intervalStart, intervalEnd]);
        }
    }

    return intervals;
}
