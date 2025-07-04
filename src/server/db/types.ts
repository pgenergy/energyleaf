import { sql } from "drizzle-orm";
import { customType, type AnyPgColumn } from "drizzle-orm/pg-core";

/**
 * This type is needed because drizzle defaults to return decimal types as string
 * this is due to the fact that the mysql decimal type can be way bigger then the js number type
 * we only have a scale of 4, 4 digets after the point.
 * so we can savely convert them to a number
 */
export const numericType = customType<{ data: number; driverData: string }>({
	dataType() {
		return "numeric(30, 6)";
	},
	fromDriver(data: string): number {
		return Number(data);
	},
});

export function lower(column: AnyPgColumn) {
	return sql`lower(${column})`;
}
