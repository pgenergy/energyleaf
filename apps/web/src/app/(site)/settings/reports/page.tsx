import MailConfigCard from "@/components/settings/mail-config-card";
import { getSession } from "@/lib/auth/auth.server";
import { isDemoUser } from "@/lib/demo/demo";
import { createMailSettingsSchema } from "@/lib/schema/conversion/profile";
import { getUserMailConfig } from "@/query/user";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Berichte - Einstellungen | Energyleaf",
};

export default async function ReportsSettingsPage() {
    const { user } = await getSession();
    if (!user) {
        redirect("/");
    }

    const isDemo = await isDemoUser();
    const mailConfig = await getUserMailConfig(user.id);
    const mailConfigInitial = createMailSettingsSchema(mailConfig);

    return (
        <>
            <h1 className="font-bold text-2xl">Berichte und Benachrichtigungen</h1>
            <MailConfigCard disabled={isDemo} initialData={mailConfigInitial} />
        </>
    );
}
