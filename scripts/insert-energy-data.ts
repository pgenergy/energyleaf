import fs from "node:fs";
import path from "node:path";
import { insertRawEnergyValues } from "@energyleaf/db/query";

export async function insertEnergyData(args: string[]) {
    const sensorId = args[0];
    if (!sensorId) {
        throw new Error("sensorId is required");
    }

    const filePath = path.join(process.cwd(), "apps", "web", "src", "lib", "demo");
    const fileContent = fs.readFileSync(path.join(filePath, "demo.json"));
    const day = new Date().getDate() + 1;
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
            sensorId,
            timestamp: dataDate,
        };
    });

    await insertRawEnergyValues(data);
}

export async function correctDemo() {
    const search = "2024-06-09T15:57:08.000Z";

    const filePath = path.join(process.cwd(), "apps", "web", "src", "lib", "demo");
    const fileContent = fs.readFileSync(path.join(filePath, "demo.json"));

    const data = JSON.parse(fileContent.toString()) as { value: number; timestamp: string }[];
    const index = data.findIndex((d) => d.timestamp === search);
    if (index === -1) {
        throw new Error("Timestamp not found");
    }

    const newData = data.map((d, i) => {
        if (i < index) {
            return d;
        }

        return {
            ...d,
            value: d.value - 0.2,
        };
    });
    fs.writeFileSync(path.join(filePath, "demo.json"), JSON.stringify(newData, null, 4));
}
