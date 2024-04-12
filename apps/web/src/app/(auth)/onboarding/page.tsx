import {CardContent} from "@energyleaf/ui";
import OnboardingWizard from "@/components/onboarding/onboarding-wizard";
import { getUserData } from "@/query/user";
import { getActionSession } from "@/lib/auth/auth.action";

export default async function OnboardingInformationPage() {
    const {user} = await getActionSession();
    if (!user) {
        return null;
    }

    const userData = await getUserData(user.id);
    if (!userData) {
        return null;
    }

    return (
        <CardContent>
            <OnboardingWizard userData={userData} />
        </CardContent>
    );
}
