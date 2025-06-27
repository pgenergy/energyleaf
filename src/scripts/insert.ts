import { energyDataTable } from "@/server/db/tables/sensor";
import { db } from "../server/db";

async function insert() {
	const file = Bun.file("./data/data.json");
	const data = (
		(await file.json()) as {
			id: string;
			sensor_id: string;
			value: number;
			consumption: number;
			value_out: number | null;
			inserted: number | null;
			value_current: number | null;
			timestamp: string;
		}[]
	).map((d) => ({
		...d,
		sensor_id: "demo_sensor",
	}));

	const chunkSize = 1000;
	const chunks = [];
	for (let i = 0; i < data.length; i += chunkSize) {
		const chunk = data.slice(i, i + chunkSize);
		chunks.push(chunk);
	}

	let count = 0;

	for (const chunk of chunks) {
		console.log(`Inserting ${chunk.length} items | Chunk: ${count}/${chunks.length}`);
		await db.transaction(async (tx) => {
			for (const item of chunk) {
				const ts = new Date(item.timestamp);
				ts.setMonth(new Date().getMonth());
                const currMonth = ts.getMonth();
				ts.setFullYear(new Date().getFullYear());
                ts.setDate(ts.getDate() + 14);
                if (currMonth !== ts.getMonth() || ts.getDate() > 30) {
                    continue;
                }
				const promises = [];
				promises.push(
					tx.insert(energyDataTable).values({
						sensorId: item.sensor_id,
						value: item.value,
						consumption: item.consumption,
						valueOut: item.value_out,
						inserted: item.inserted,
						valueCurrent: item.value_current,
						timestamp: ts,
					})
				);
				await Promise.all(promises);
			}
		});
		count++;
	}
}

insert()
	.then(() => {})
	.catch((err) => console.error(err))
	.finally(() => process.exit(0));
