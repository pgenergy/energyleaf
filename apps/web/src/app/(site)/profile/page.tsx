import AccountDeletionForm from "@/components/profile/account-deletion-form";
import BaseInformationForm from "@/components/profile/base-information-form";
import ChangePasswordForm from "@/components/profile/change-password-form";
import UserDataForm from "@/components/profile/data-form";
import ReportConfigForm from "@/components/profile/report-config-form";
import UserGoalsForm from "@/components/profile/user-goals-form";
import { getSession } from "@/lib/auth/auth.server";
import { isDemoUser } from "@/lib/demo/demo";
import {
    createMailSettingsSchemaFromUserDataType,
    createUserDataSchemaFromUserDataType,
} from "@/lib/schema/conversion/profile";
import { getUserData } from "@/query/user";
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
    const data = createUserDataSchemaFromUserDataType(userData);

    const reportConfig = createMailSettingsSchemaFromUserDataType(userData);

    return (
        <div className="flex flex-col gap-4">
            <BaseInformationForm disabled={isDemo} email={user.email} username={user.username} />
            <ChangePasswordForm disabled={isDemo} />
            <ReportConfigForm disabled={isDemo} reportConfig={reportConfig} onSubmit={() => {}} />
            <UserDataForm initialData={data} />
            {fulfills(user.appVersion, Versions.self_reflection) && <UserGoalsForm userData={userData?.user_data} />}
            <AccountDeletionForm disabled={isDemo} />
        </div>
    );
}
