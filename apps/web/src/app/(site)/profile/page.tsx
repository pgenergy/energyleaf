import AccountDeletionForm from "@/components/profile/account-deletion-form";
import BaseInformationForm from "@/components/profile/base-information-form";
import ChangePasswordForm from "@/components/profile/change-password-form";
import UserDataForm from "@/components/profile/data-form";
import ReportConfigCard from "@/components/profile/report-config-card";
import UserGoalsForm from "@/components/profile/user-goals-form";
import { getSession } from "@/lib/auth/auth.server";
import { isDemoUser } from "@/lib/demo/demo";
import { createMailSettingsSchema, createUserDataSchemaFromUserDataSelectType } from "@/lib/schema/conversion/profile";
import { getUserData, getUserMailConfig } from "@/query/user";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Profil | Energyleaf",
};

export default async function ProfilePage() {
    const { user } = await getSession();

    if (!user) {
        redirect("/");
    }

    const isDemo = await isDemoUser();

    const userData = await getUserData(user.id);
    const data = createUserDataSchemaFromUserDataSelectType(userData);

    const mailConfig = await getUserMailConfig(user.id);
    const mailConfigInitial = createMailSettingsSchema(mailConfig);

    return (
        <div className="flex flex-col gap-4">
            <BaseInformationForm
                disabled={isDemo}
                firstname={user.firstname}
                lastname={user.lastname}
                email={user.email}
                username={user.username}
                phone={user.phone ?? undefined}
                address={user.address}
            />
            <ChangePasswordForm disabled={isDemo} />
            <ReportConfigCard disabled={isDemo} initialData={mailConfigInitial} />
            <UserDataForm initialData={data} />
            {fulfills(user.appVersion, Versions.self_reflection) && <UserGoalsForm userData={userData ?? undefined} />}
            <AccountDeletionForm disabled={isDemo} />
        </div>
    );
}
