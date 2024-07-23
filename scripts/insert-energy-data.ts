import fs from "node:fs/promises";
import path from "node:path";
import { genId } from "@energyleaf/db";
import { getRawEnergyForSensorInRange, insertRawEnergyValues } from "@energyleaf/db/query";

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
    start.setDate(start.getDate() - 14);
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

    const splitSize = 1000;
    for (let i = 0; i < data.length; i += splitSize) {
        const chunk = data.slice(i, i + splitSize);
        await insertRawEnergyValues(
            chunk.map((d) => ({
                ...d,
                sensorId,
                timestamp: new Date(d.timestamp),
            })),
        );
    }
}
