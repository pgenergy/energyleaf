import ChangePasswordForm from "@/components/settings/change-password-form";
import { getSession } from "@/lib/auth/auth.server";
import { isDemoUser } from "@/lib/demo/demo";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Sicherheit - Einstellungen | Energyleaf",
};

export default async function SecurityPage() {
    const { user } = await getSession();
    if (!user) {
        redirect("/");
    }
    const isDemo = await isDemoUser();

    return (
        <>
            <h1 className="font-bold text-2xl">Passwort und Sicherheit</h1>
            <ChangePasswordForm disabled={isDemo} />
        </>
    );
}
