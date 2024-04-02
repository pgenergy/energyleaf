"use client";

import {cookies} from "next/headers";
import {Button} from "@energyleaf/ui";
import {completeOnboarding} from "@/actions/onboarding";
import {useTransition} from "react";

export default function OnboardingWizard() {
    const [pending, startTransition] = useTransition();

    function onClick() {
        startTransition(completeOnboarding);
    }

    return (
        <Button onClick={onClick}>
            Klick mich
        </Button>
    )
}