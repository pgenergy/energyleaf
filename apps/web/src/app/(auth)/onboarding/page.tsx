import OnboardingWizard from "@/components/onboarding/onboarding-wizard";
import { getActionSession } from "@/lib/auth/auth.action";
import { getUserData } from "@/query/user";

import { CardContent } from "@energyleaf/ui";

export default async function OnboardingInformationPage() {
    const { user } = await getActionSession();
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