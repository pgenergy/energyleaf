import fs from "node:fs/promises";
import path from "node:path";
import { genId } from "@energyleaf/db";
import { findAndMark, getRawEnergyForSensorInRange, insertRawEnergyValues } from "@energyleaf/db/query";

export async function insertEnergyData(args: string[]) {
    const sensorId = args[0];
    if (!sensorId) {
        throw new Error("sensorId is required");
    }

    const filePath = path.join(process.cwd(), "apps", "web", "src", "lib", "demo");
    const fileContent = await fs.readFile(path.join(filePath, "demo.json"));
    const day = new Date().getDate();
    const month = new Date().getMonth();
    const data = (
        JSON.parse(fileContent.toString()) as {
            id: string;
            sensorId: string;
            value: number;
            timestamp: string;
        }[]
    ).map((d) => {
        const dataDate = new Date(d.timestamp);
        dataDate.setDate(day);
        dataDate.setMonth(month);
        return {
            ...d,
            id: genId(),
            sensorId,
            timestamp: dataDate,
        };
    });

    await insertRawEnergyValues(data);
}

export async function download(args: string[]) {
    const sensorId = args[0];
    if (!sensorId) {
        throw new Error("sensorId is required");
    }

    const filePath = path.join(process.cwd(), "download.json");

    const start = new Date();
    start.setDate(start.getDate() - 19);
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const data = await getRawEnergyForSensorInRange(start, end, sensorId);
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
        start: startDate,
        end: endDate,
        sensorId,
        type: "peak",
    });
}
