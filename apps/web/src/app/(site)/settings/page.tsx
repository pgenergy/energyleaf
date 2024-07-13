import BaseInformationForm from "@/components/settings/base-information-form";
import UserDataForm from "@/components/settings/data-form";
import { getSession } from "@/lib/auth/auth.server";
import { isDemoUser } from "@/lib/demo/demo";
import { createUserDataSchemaFromUserDataSelectType } from "@/lib/schema/conversion/profile";
import { getUserData } from "@/query/user";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Profil - Einstellungen | Energyleaf",
};

export default async function ProfilePage() {
    const { user } = await getSession();
    if (!user) {
        redirect("/");
    }

    const isDemo = await isDemoUser();
    const userData = await getUserData(user.id);
    const data = createUserDataSchemaFromUserDataSelectType(userData);

    return (
        <>
            <h1 className="font-bold text-2xl">Profil</h1>
            <BaseInformationForm
                disabled={isDemo}
                firstname={user.firstname}
                lastname={user.lastname}
                email={user.email}
                username={user.username}
                phone={user.phone ?? undefined}
                address={user.address}
            />
            <UserDataForm initialData={data} />
        </>
    );
}
