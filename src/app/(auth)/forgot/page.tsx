import PasswordForgotForm from "@/components/forms/auth/forgot-form";
import PasswordResetForm from "@/components/forms/auth/password-reset-form";
import { db } from "@/server/db";
import { tokenTable } from "@/server/db/tables/user";
import { differenceInMinutes } from "date-fns";
import { eq } from "drizzle-orm";

type SearchParams = Promise<{ token?: string }>;

export const metadata = {
	title: "Passwort vergessen - Energyleaf",
	robots: "noindex, nofollow",
};

export default async function PasswordForgotPage({ searchParams }: { searchParams: SearchParams }) {
	const { token } = await searchParams;
	if (token) {
		const tokenData = await db.select().from(tokenTable).where(eq(tokenTable.token, token)).limit(1);
		if (tokenData.length !== 1 || tokenData[0].type !== "password_reset") {
			return <ForgotState />;
		}

		if (differenceInMinutes(tokenData[0].createdTimestamp, new Date()) > 5) {
			await db.delete(tokenTable).where(eq(tokenTable.token, token));
			return <ForgotState />;
		}

		return (
			<div className="flex flex-col gap-2">
				<p className="text-xl font-bold">Passwort zurücksetzen</p>
				<PasswordResetForm />
			</div>
		);
	}

	return <ForgotState />;
}

function ForgotState() {
	return (
		<div className="flex flex-col gap-2">
			<p className="text-xl font-bold">Passwort zurücksetzen</p>
			<PasswordForgotForm />
		</div>
	);
}
