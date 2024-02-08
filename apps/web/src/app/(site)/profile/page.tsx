import { redirect } from "next/navigation";
import AccountDeletionComponent from "@/components/profile/account-deletion-component";
import BaseInformationComponent from "@/components/profile/base-information-component";
import ChangePasswordComponent from "@/components/profile/change-password-component";
import UserDataComponent from "@/components/profile/data-component";
import MailSettingsComponent from "@/components/profile/mail-settings-component";
import { getSession } from "@/lib/auth/auth";
import { getUserData } from "@/query/user";

export default async function ProfilePage() {
    const session = await getSession();

    if (!session?.user.id || !session.user.email || !session.user.name) {
        redirect("/");
    }

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
            <BaseInformationComponent email={session.user.email} id={session.user.id} username={session.user.name} />
            <ChangePasswordComponent id={session.user.id} />
            <MailSettingsComponent
                daily={userData?.mail.mailDaily || false}
                id={session.user.id}
                weekly={userData?.mail.mailWeekly || false}
            />
            <UserDataComponent id={session.user.id} initialData={data} />
            <AccountDeletionComponent id={session.user.id} />
        </div>
    );
}
