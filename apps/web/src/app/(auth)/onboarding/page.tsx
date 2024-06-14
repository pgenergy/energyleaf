import OnboardingWizard from "@/components/onboarding/onboarding-wizard";
import { getActionSession } from "@/lib/auth/auth.action";
import { getUserData, getUserMailConfig } from "@/query/user";
import { Versions, fulfills } from "@energyleaf/lib/versioning";
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

    const mailConfig = await getUserMailConfig(user.id);

    return (
        <CardContent>
            <OnboardingWizard
                showGoals={fulfills(user.appVersion, Versions.self_reflection)}
                userData={userData}
                mailConfig={mailConfig}
            />
        </CardContent>
    );
}
