import fs from "node:fs/promises";
import path from "node:path";
import { convertTZDate } from "@energyleaf/lib";
import { db, genId } from "@energyleaf/postgres";
import { findAndMark } from "@energyleaf/postgres/query/peaks";
import { sensorDataTable as sensorData } from "@energyleaf/postgres/schema/sensor";
import { differenceInDays } from "date-fns";
import { and, between, eq } from "drizzle-orm";

export async function insertEnergyData(args: string[]) {
    const sensorId = args[0];
    if (!sensorId) {
        throw new Error("sensorId is required");
    }

    await insertSensorData(sensorId);
}

export async function download(args: string[]) {
    const sensorId = args[0];
    if (!sensorId) {
        throw new Error("sensorId is required");
    }

    const filePath = path.join(process.cwd(), "download.json");

    const start = new Date();
    start.setDate(start.getDate() - 15);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);

    const queryStart = convertTZDate(start);
    const queryEnd = convertTZDate(end);

    const data = await db
        .select()
        .from(sensorData)
        .where(and(eq(sensorData.sensorId, sensorId), between(sensorData.timestamp, queryStart, queryEnd)))
        .orderBy(sensorData.timestamp);
    await fs.writeFile(filePath, JSON.stringify(data));
}

export async function markPeaks(args: string[]) {
    const sensorId = args[0];
    if (!sensorId) {
        throw new Error("sensorId is required");
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 10);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 5);

    await markPeaksInPeriod(sensorId, startDate, endDate);
}

export async function addDemoData() {
    const sensorId = "demo_sensor";
    const { from, to } = await insertSensorData(sensorId);

    const peakFrom = new Date(from);
    peakFrom.setDate(peakFrom.getDate() + 2);
    await markPeaksInPeriod(sensorId, peakFrom, to);
}

async function insertSensorData(sensorId: string) {
    const filePath = path.join(process.cwd());
    const fileContent = await fs.readFile(path.join(filePath, "download.json"));
    const current = new Date();
    const data = JSON.parse(fileContent.toString()) as {
        id: string;
        sensorId: string;
        value: number;
        valueOut: number | null;
        valueCurrent: number | null;
        timestamp: string;
        consumption: number;
        inserted: number;
    }[];

    const lastEntry = data[data.length - 1];
    const timeDiff = differenceInDays(current, new Date(lastEntry.timestamp));

    const processedData = data.map((d, i) => {
        const newDate = new Date(d.timestamp);
        newDate.setDate(newDate.getDate() + timeDiff + 1);
        const consumption: number = i === 0 ? 0 : d.value - data[i - 1].value;

        return {
            ...d,
            id: genId(),
            timestamp: newDate,
            consumption,
            sensorId,
        };
    });

    // chunk data
    await db.transaction(async (trx) => {
        const splitSize = 1000;
        for (let i = 0; i < processedData.length; i += splitSize) {
            const chunk = processedData.slice(i, i + splitSize);
            await trx.insert(sensorData).values(chunk);
        }
    });

    console.log("Data successfully inserted.");

    return {
        from: processedData[0].timestamp,
        to: processedData[processedData.length - 1].timestamp,
    };
}

async function markPeaksInPeriod(sensorId: string, from: Date, to: Date) {
    await findAndMark({
        timePeriod: {
            start: from,
            end: to,
        },
        sensorId,
        type: "peak",
    });
    console.log("Peaks successfully marked.");
}
