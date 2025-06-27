import { DeviceCategory, DeviceCategoryValue } from "@/lib/enums";
import { genID } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { boolean, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { numericType } from "../types";
import { energyDataSequenceTable } from "./sensor";
import { userTable } from "./user";

export const deviceTable = pgTable("device", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => genID(30)),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	category: text("category", { enum: Object.values(DeviceCategory) as [DeviceCategoryValue] }).notNull(),
	created: timestamp("created", { mode: "date", withTimezone: true }).default(sql`now()`),
	timestamp: timestamp("timestamp", { mode: "date", withTimezone: true })
		.default(sql`now()`)
		.$onUpdateFn(() => new Date())
		.notNull(),
	power: numericType("power"),
	isPowerEstimated: boolean("is_power_estimated").default(true).notNull(),
	weeklyUsageEstimation: numericType("weekly_usage_estimation"),
});

export type Device = typeof deviceTable.$inferSelect;

export const deviceToPeakTable = pgTable(
	"device_to_peak",
	{
		deviceId: text("device_id").notNull(),
		energyDataSequenceId: text("energy_data_sequence_id")
			.notNull()
			.references(() => energyDataSequenceTable.id, { onDelete: "cascade" }),
	},
	(table) => {
		return [
			{
				pk: primaryKey({ columns: [table.deviceId, table.energyDataSequenceId] }),
			},
		];
	}
);

export type DeviceToPeak = typeof deviceToPeakTable.$inferSelect;
