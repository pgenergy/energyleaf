import { customType } from "drizzle-orm/mysql-core";

/**
 * This type is needed because drizzle defaults to return decimal types as string
 * this is due to the fact that the mysql decimal type can be way bigger then the js number type
 * we only have a scale of 4, 4 digets after the point.
 * so we can savely convert them to a number
 */
export const decimalType = customType<{ data: number; driverData: string }>({
    dataType() {
        return "decimal(30, 6)";
    },
    fromDriver(data: string): number {
        return Number(data);
    },
});
