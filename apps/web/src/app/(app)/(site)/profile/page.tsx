import { redirect } from "next/navigation";
import BaseInformationForm from "@/components/profile/base-information-form";
import UserDataForm from "@/components/profile/data-form";
import MailSettingsForm from "@/components/profile/mail-settings-form";
import { getSession } from "@/lib/auth/auth.config";
import { getUserData } from "@/query/user";

export default async function ProfilePage() {
    const session = await getSession();

    if (!session?.user.id || !session.user.email || !session.user.name) {
        redirect("/");
    }

    const userData = await getUserData(session.user.id);
    const data = {
        houseType: userData?.user_data.immobilie || "house",
        houseSize: userData?.user_data.wohnfläche || 0,
        people: userData?.user_data.household || 0,
        warmWater: userData?.user_data.warmwasser || "electric",
        budget: userData?.user_data.budget || 0,
        tarif: userData?.user_data.tarif || "basic",
        price: userData?.user_data.basispreis || 0,
    };

    return (
        <div className="flex flex-col gap-4">
            <BaseInformationForm email={session.user.email} id={session.user.id} username={session.user.name} />
            <MailSettingsForm
                daily={userData?.mail.mailDaily || false}
                id={session.user.id}
                weekly={userData?.mail.mailWeekly || false}
            />
            <UserDataForm id={session.user.id} initialData={data} />
        </div>
    );
}
