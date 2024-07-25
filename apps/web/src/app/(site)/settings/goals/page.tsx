import UserGoalsForm from "@/components/settings/user-goals-form";
import { getSession } from "@/lib/auth/auth.server";
import { getUserData } from "@/query/user";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Ziele - Einstellungen | Energyleaf",
};

export default async function GoalsSettingsPage() {
    const { user } = await getSession();
    if (!user) {
        redirect("/");
    }
    if (!fulfills(user.appVersion, Versions.self_reflection)) {
        redirect("/settings");
    }

    const userData = await getUserData(user.id);

    return (
        <>
            <h1 className="font-bold text-2xl">Ziele</h1>
            <UserGoalsForm userData={userData ?? undefined} />
        </>
    );
}
