import { insertRawEnergyValues } from "@energyleaf/db/query";
import fs from "node:fs";
import path from "node:path";

export async function insertEnergyData(args: string[]) {
    const sensorId = args[0];
    if (!sensorId) {
        throw new Error("sensorId is required");
    }

    const filePath = path.join(process.cwd(), "packages", "lib", "src", "data");
    const fileContent = fs.readFileSync(path.join(filePath, "demo.json"));
    const day = new Date().getDate() + 1;
    const month = new Date().getMonth();
    const data = (JSON.parse(fileContent.toString()) as {
        id: string;
        sensorId: string;
        value: number;
        timestamp: string;
    }[]).map((d) => {
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
