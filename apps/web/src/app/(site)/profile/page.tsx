import {redirect} from "next/navigation";
import AccountDeletionForm from "@/components/profile/account-deletion-form";
import BaseInformationForm from "@/components/profile/base-information-form";
import ChangePasswordForm from "@/components/profile/change-password-form";
import UserDataForm from "@/components/profile/data-form";
import ReportConfigCard from "@/components/profile/report-config-card";
import UserGoalsForm from "@/components/profile/user-goals-form";
import {getSession} from "@/lib/auth/auth.server";
import {isDemoUser} from "@/lib/demo/demo";
import {getUserData} from "@/query/user";

export const metadata = {
    title: "Profil | Energyleaf",
};

export default async function ProfilePage() {
    const {session, user} = await getSession();

    if (!session) {
        redirect("/");
    }

    const isDemo = await isDemoUser();

    const userData = await getUserData(user.id);
    const dataUserDataForm = {
        houseType: userData?.user_data.property || "house",
        livingSpace: userData?.user_data.livingSpace || 0,
        people: userData?.user_data.household || 0,
        hotWater: userData?.user_data.hotWater || "electric",
        tariff: userData?.user_data.tariff || "basic",
        basePrice: userData?.user_data.basePrice || 0,
        workingPrice: userData?.user_data.workingPrice || 0,
        monthlyPayment: userData?.user_data.monthlyPayment || 0,
    };

    return (
        <div className="flex flex-col gap-4">
            <BaseInformationForm disabled={isDemo} email={user.email} username={user.username}/>
            <ChangePasswordForm disabled={isDemo}/>
            <ReportConfigCard
                disabled={isDemo}
                interval={userData?.report_config.interval || 3}
                receiveMails={userData?.report_config.receiveMails || false}
                time={userData?.report_config.time || 6}
            />
            <UserDataForm initialData={dataUserDataForm}/>
            <UserGoalsForm userData={userData?.user_data}/>
            <AccountDeletionForm disabled={isDemo}/>
        </div>
    );
}
