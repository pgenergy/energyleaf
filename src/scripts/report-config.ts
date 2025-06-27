import { db } from "@/server/db";
import { reportConfigTable } from "@/server/db/tables/reports";
import { userTable } from "@/server/db/tables/user";

async function main() {
	const users = await db.select({ id: userTable.id }).from(userTable);

	for (const user of users) {
		await db.insert(reportConfigTable).values({
			userId: user.id,
		});
	}
}

main()
	.catch((err) => console.error(err))
	.finally(() => process.exit(0));
