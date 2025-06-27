import { db } from "@/server/db";
import { sensorTable } from "@/server/db/tables/sensor";
import { lower } from "@/server/db/types";
import { eq } from "drizzle-orm";

async function main() {
    const data = await db
        .select()
        .from(sensorTable)
        .where(eq(lower(sensorTable.clientId), "F4:CF:A2:6D:C4:41".toLowerCase()));

    console.log(data);
}

main()
    .catch((err) => console.error(err))
    .finally(() => process.exit(0));
