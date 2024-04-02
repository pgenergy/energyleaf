import Link from "next/link";

import {Button, CardContent, Separator} from "@energyleaf/ui";
import OnboardingWizard from "@/components/onboarding/onboarding-wizard";

export default function OnboardingInformationPage() {
    return (
        <CardContent>
            <OnboardingWizard />
        </CardContent>
    );
}
