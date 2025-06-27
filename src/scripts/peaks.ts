import { findAndMark } from "@/server/lib/peaks";
import { addMinutes, endOfMonth, startOfMonth } from "date-fns";

async function findPeaks(sensorId: string) {
	const start = startOfMonth(new Date());
	const end = endOfMonth(start);

	let currentStart = start;

	while (currentStart < end) {
		const currentEnd = addMinutes(currentStart, 30);
		const intervalEnd = currentEnd > end ? end : currentEnd;

		await findAndMark({
			sensorId,
			start: currentStart,
			end: intervalEnd,
			type: "peak",
		});

		currentStart = currentEnd;
	}
}

findPeaks("fioahwifhanwofha")
	.then(() => {})
	.catch((err) => console.error(err))
	.finally(() => process.exit(0));
