"use client";

import {cookies} from "next/headers";
import {Button, Form, Skeleton, useWizard, Wizard, WizardPage} from "@energyleaf/ui";
import {completeOnboarding} from "@/actions/onboarding";
import React, {useMemo, useTransition} from "react";
import {ArrowRight, ArrowRightIcon} from "lucide-react";
import Link from "next/link";
import UserGoalsForm from "@/components/profile/user-goals-form";
import {useForm} from "react-hook-form";
import type {z} from "zod";
import {userGoalSchema} from "@/lib/schema/profile";
import {zodResolver} from "@hookform/resolvers/zod";
import UserGoalsFormFields from "@/components/profile/user-goals-form-fields";

export default function OnboardingWizard() {
    const [pending, startTransition] = useTransition();

    function onClick() {
        startTransition(completeOnboarding);
    }

    return (
        <Wizard>
            <InformationStep />
            <UserDataStep />
            <GoalStep />
        </Wizard>
    )
}

function InformationStep() {
    return (
        <WizardPage title="Onboarding">
            <p>
                Um die App in vollem Umfang nutzen zu können, sollten Sie die in den folgenden Schritten geforderten
                Daten angeben.
                Möchten Sie Ihre Daten nicht angeben, so können Sie diesen Schritt auch überspringen und die Daten
                später in Ihren Profil angeben.
            </p>
            <div className="flex justify-center w-full pt-3">
                <Button
                    className="flex flex-row items-center justify-center gap-2 text-sm text-muted-foreground"
                    variant="ghost"
                >
                    Überspringen
                    <ArrowRightIcon className="h-4 w-4" />
                </Button>
            </div>
        </WizardPage>
    )
}

function UserDataStep() {
    const { handleStep } = useWizard();
    handleStep(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
    })

    return (
        <WizardPage title="Tarif- und Verbrauchsdaten">
            Test
        </WizardPage>
    )
}

function GoalStep() {
    const form = useForm<z.infer<typeof userGoalSchema>>({
        resolver: zodResolver(userGoalSchema),
        defaultValues: {
            goalValue: 0, // TODO: Preset
        }
    });

    const { handleNextClick } = useWizard();

    handleNextClick(async (onSuccess) => {
        await form.handleSubmit(async (data: z.infer<typeof userGoalSchema>) => {
            await onSuccess();
        })();
    });

    return (
        <WizardPage title="Test">
            <Form {...form}>
                <form className="flex flex-col gap-4">
                    <UserGoalsFormFields form={form} />
                </form>
            </Form>
        </WizardPage>
    )
}