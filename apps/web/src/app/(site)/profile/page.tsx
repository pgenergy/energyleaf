import { redirect } from "next/navigation";
import AccountDeletionForm from "@/components/profile/account-deletion-form";
import BaseInformationForm from "@/components/profile/base-information-form";
import UserDataForm from "@/components/profile/data-form";
import MailSettingsForm from "@/components/profile/mail-settings-form";
import { getSession } from "@/lib/auth/auth";
import { isDemoUser } from "@/lib/demo/demo";
import { getUserData } from "@/query/user";

export default async function ProfilePage() {
    const session = await getSession();

    if (!session?.user.id || !session.user.email || !session.user.name) {
        redirect("/");
    }

    const isDemo = await isDemoUser();

    const userData = await getUserData(session.user.id);
    const data = {
        houseType: userData?.user_data.property || "house",
        livingSpace: userData?.user_data.livingSpace || 0,
        people: userData?.user_data.household || 0,
        hotWater: userData?.user_data.hotWater || "electric",
        budget: userData?.user_data.budget || 0,
        tariff: userData?.user_data.tariff || "basic",
        basePrice: userData?.user_data.basePrice || 0,
        monthlyPayment: userData?.user_data.monthlyPayment || 0,
    };

    return (
        <div className="flex flex-col gap-4">
            <BaseInformationForm disabled={isDemo} email={session.user.email} username={session.user.name} />
            <MailSettingsForm
                daily={userData?.mail.mailDaily || false}
                disabled={isDemo}
                weekly={userData?.mail.mailWeekly || false}
            />
            <UserDataForm disabled={isDemo} initialData={data} />
            <AccountDeletionForm disabled={isDemo} />
        </div>
    );
}
