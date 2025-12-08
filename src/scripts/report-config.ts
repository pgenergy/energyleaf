import { db } from "@/server/db";
import { reportConfigTable } from "@/server/db/tables/reports";
import { userTable } from "@/server/db/tables/user";
import { eq } from "drizzle-orm";

async function main() {
	const users = await db.select({ id: userTable.id }).from(userTable);

	for (const user of users) {
		const existing = await db
			.select({ id: reportConfigTable.id })
			.from(reportConfigTable)
			.where(eq(reportConfigTable.userId, user.id))
			.limit(1);

		if (existing.length === 0) {
			await db.insert(reportConfigTable).values({ userId: user.id });
		}
	}
}

main()
	.catch((err) => console.error(err))
	.finally(() => process.exit(0));
