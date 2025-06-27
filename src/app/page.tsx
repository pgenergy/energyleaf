import { getCurrentSession } from "@/server/lib/auth";
import { redirect } from "next/navigation";

export default async function StartPage() {
	const { user } = await getCurrentSession();

	if (user) {
		redirect("/dashboard");
	} else {
		redirect("/login");
	}
}
