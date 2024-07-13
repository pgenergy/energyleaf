import AccountDeletionForm from "@/components/settings/account-deletion-form";
import { getSession } from "@/lib/auth/auth.server";
import { isDemoUser } from "@/lib/demo/demo";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Konto - Einstellungen | Energyleaf",
};

export default async function AccountPage() {
    const { user } = await getSession();
    if (!user) {
        redirect("/");
    }
    const isDemo = await isDemoUser();

    return (
        <>
            <h1 className="font-bold text-2xl">Konto</h1>
            <AccountDeletionForm disabled={isDemo} />
        </>
    );
}
