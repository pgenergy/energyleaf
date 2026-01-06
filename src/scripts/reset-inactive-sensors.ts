import { subDays } from "date-fns";
import { and, eq, gte, inArray, isNotNull } from "drizzle-orm";
import { genID } from "@/lib/utils";
import { db } from "@/server/db";
import { energyDataTable, sensorHistoryTable, sensorTable, sensorTokenTable } from "@/server/db/tables/sensor";

const INACTIVE_DAYS = 14;

async function main() {
	const dryRun = process.argv.includes("--dry-run");

	if (dryRun) {
		console.log("=== DRY RUN MODE - No changes will be made ===\n");
	}

	const twoWeeksAgo = subDays(new Date(), INACTIVE_DAYS);

	// 1. Get all sensors with a user assigned
	const sensorsWithUsers = await db
		.select({
			id: sensorTable.id,
			clientId: sensorTable.clientId,
			userId: sensorTable.userId,
			sensorType: sensorTable.sensorType,
		})
		.from(sensorTable)
		.where(isNotNull(sensorTable.userId));

	if (sensorsWithUsers.length === 0) {
		console.log("No sensors with users found.");
		return;
	}

	console.log(`Found ${sensorsWithUsers.length} sensors with users assigned.`);

	// 2. Find sensors that have data in the last 2 weeks (batch query)
	const sensorIds = sensorsWithUsers.map((s) => s.id);
	const sensorsWithRecentData = await db
		.selectDistinct({ sensorId: energyDataTable.sensorId })
		.from(energyDataTable)
		.where(and(inArray(energyDataTable.sensorId, sensorIds), gte(energyDataTable.timestamp, twoWeeksAgo)));

	const activeSet = new Set(sensorsWithRecentData.map((s) => s.sensorId));

	// 3. Filter to sensors WITHOUT recent data
	const inactiveSensors = sensorsWithUsers.filter((s) => !activeSet.has(s.id));

	console.log(`Found ${inactiveSensors.length} inactive sensors (no data in last ${INACTIVE_DAYS} days).`);

	if (inactiveSensors.length === 0) {
		console.log("No sensors to reset.");
		return;
	}

	if (dryRun) {
		console.log("\nSensors that would be reset:");
		for (const sensor of inactiveSensors) {
			console.log(`  - Sensor ${sensor.id} (client: ${sensor.clientId}, user: ${sensor.userId})`);
		}
		console.log("\nRun without --dry-run to apply changes.");
		return;
	}

	// 4. Process each inactive sensor in a transaction
	for (const sensor of inactiveSensors) {
		const userId = sensor.userId;
		if (!userId) {
			continue;
		}

		const newSensorId = genID(25);

		await db.transaction(async (tx) => {
			// Store old sensor info in history
			await tx.insert(sensorHistoryTable).values({
				sensorId: sensor.id,
				userId: userId,
				sensorType: sensor.sensorType,
				clientId: sensor.clientId,
			});

			// Delete sensor tokens (FK constraint on sensor_id)
			await tx.delete(sensorTokenTable).where(eq(sensorTokenTable.sensorId, sensor.id));

			// Update sensor: new ID, remove user
			await tx
				.update(sensorTable)
				.set({
					id: newSensorId,
					userId: null,
				})
				.where(eq(sensorTable.clientId, sensor.clientId));
		});

		console.log(`Reset sensor ${sensor.id} -> ${newSensorId} (was assigned to user ${userId})`);
	}

	console.log("\nDone.");
}

main()
	.catch((err) => console.error(err))
	.finally(() => process.exit(0));
