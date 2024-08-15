import fs from "node:fs/promises";
import path from "node:path";
import db, { genId } from "@energyleaf/db";
import { findAndMark, insertRawEnergyValues } from "@energyleaf/db/query";
import { sensorData } from "@energyleaf/db/schema";
import { convertTZDate } from "@energyleaf/lib";
import { differenceInDays } from "date-fns";
import { and, between, eq } from "drizzle-orm";

export async function insertEnergyData(args: string[]) {
    const sensorId = args[0];
    if (!sensorId) {
        throw new Error("sensorId is required");
    }

    const filePath = path.join(process.cwd(), "apps", "web", "src", "lib", "demo");
    const fileContent = await fs.readFile(path.join(filePath, "demo.json"));
    const current = new Date();
    const data = JSON.parse(fileContent.toString()) as {
        id: string;
        sensorId: string;
        value: number;
        valueOut: number | null;
        valueCurrent: number | null;
        timestamp: string;
    }[];

    const lastEntry = data[data.length - 1];
    const timeDiff = differenceInDays(current, new Date(lastEntry.timestamp));

    const processedData = data.map((d) => {
        const newDate = new Date(d.timestamp);
        newDate.setDate(newDate.getDate() + timeDiff + 1);

        return {
            ...d,
            id: genId(),
            timestamp: newDate,
            sensorId,
        };
    });

    await insertRawEnergyValues(processedData);
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
        .where(and(eq(sensorData.sensorId, sensorId), between(sensorData.timestamp, queryStart, queryEnd)));
    await fs.writeFile(filePath, JSON.stringify(data));
}

export async function upload(args: string[]) {
    const sensorId = args[0];
    if (!sensorId) {
        throw new Error("sensorId is required");
    }

    const filePath = path.join(process.cwd());
    const fileContent = await fs.readFile(path.join(filePath, "download.json"));
    const data = JSON.parse(fileContent.toString()) as {
        id: string;
        sensorId: string;
        value: number;
        valueOut: number | null;
        valueCurrent: number | null;
        timestamp: string;
    }[];

    const processedData = data.map((d, i) => {
        const totalBefore = data.slice(0, i).reduce((acc, d) => acc + d.value, 0);
        const newDate = new Date(d.timestamp);
        newDate.setDate(newDate.getDate() + 7);

        return {
            ...d,
            value: i === 0 ? 0 : d.value + totalBefore,
            valueCurrent: i === 0 ? 0 : d.valueCurrent,
            valueOut: null,
            timestamp: newDate,
        };
    });

    const splitSize = 1000;
    for (let i = 0; i < processedData.length; i += splitSize) {
        const chunk = processedData.slice(i, i + splitSize);
        await insertRawEnergyValues(
            chunk.map((d) => ({
                ...d,
                sensorId,
            })),
        );
    }
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

    await findAndMark({
        timePeriod: {
            start: startDate,
            end: endDate,
        },
        sensorId,
        type: "peak",
    });
}
