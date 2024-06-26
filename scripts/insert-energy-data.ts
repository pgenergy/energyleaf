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
