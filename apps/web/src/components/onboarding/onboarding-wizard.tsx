"use client";

import {cookies} from "next/headers";
import {Button, Form, Skeleton, useWizard, Wizard, WizardPage} from "@energyleaf/ui";
import {completeOnboarding} from "@/actions/onboarding";
import React, {useEffect, useMemo, useState, useTransition} from "react";
import {ArrowRight, ArrowRightIcon, InfoIcon} from "lucide-react";
import Link from "next/link";
import UserGoalsForm from "@/components/profile/user-goals-form";
import {useForm} from "react-hook-form";
import type {z} from "zod";
import {userDataSchema, userGoalSchema} from "@/lib/schema/profile";
import {zodResolver} from "@hookform/resolvers/zod";
import UserGoalsFormFields from "@/components/profile/user-goals-form-fields";
import {UserDataSelectType} from "@energyleaf/db/types";
import {updateUserDataInformation, updateUserGoals} from "@/actions/profile";
import {toast} from "sonner";
import DataFormFields from "@/components/profile/data-form-fields";

export default function OnboardingWizard({userData}: StepProps) {
    function finishHandler() {
        toast.promise(completeOnboarding(), {
            loading: "Schließe Onboarding ab...",
            success: "Onboarding abgeschlossen",
            error: "Fehler beim Abschließen des Onboardings"
        });
    }

    return (
        <Wizard finishHandler={finishHandler}>
            <InformationStep />
            <UserDataStep userData={userData} />
            <GoalStep userData={userData} />
            <ThankYouStep />
        </Wizard>
    )
}

function InformationStep() {
    function onSkip() {
        toast.promise(completeOnboarding(), {
            loading: "Überspringe Onboarding...",
            success: "Onboarding übersprungen",
            error: "Fehler beim Überspringen des Onboardings"
        });
    }

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
                    onClick={onSkip}
                >
                    Überspringen
                    <ArrowRightIcon className="h-4 w-4" />
                </Button>
            </div>
        </WizardPage>
    )
}

interface StepProps {
    userData: UserDataSelectType;
}

function UserDataStep({userData}: StepProps) {
    const form = useForm<z.infer<typeof userDataSchema>>({
        resolver: zodResolver(userDataSchema),
        defaultValues: {
            // TODO: In eigene Methode auslagern? Wird im Profil auch verwendet...
            houseType: userData.property || "house",
            livingSpace: userData?.livingSpace || 0,
            people: userData?.household || 0,
            hotWater: userData?.hotWater || "electric",
            tariff: userData?.tariff || "basic",
            basePrice: userData?.basePrice || 0,
            workingPrice: userData?.workingPrice || 0,
            monthlyPayment: userData?.monthlyPayment || 0,
        }
    });

    const { handleNextClick, handleStep } = useWizard();

    handleNextClick(async (onSuccess) => {
        await form.handleSubmit(async () => {
            await onSuccess();
        })();
    });

    handleStep(async () => {
        const data: z.infer<typeof userDataSchema> = form.getValues();
        await updateUserDataInformation(data);
    });

    return (
        <WizardPage title="Tarif- und Verbrauchsdaten">
            <Form {...form}>
                <form className="flex flex-col gap-4">
                    <DataFormFields form={form} />
                </form>
            </Form>
        </WizardPage>
    )
}

function GoalStep({userData}: StepProps) {
    const goalCalculated = useMemo(() => {
        return !Boolean(userData?.consumptionGoal);
    }, [userData]);

    function calculateGoal(userData: UserDataSelectType) {
        if (!userData?.monthlyPayment || !userData.basePrice || !userData.workingPrice) {
            return 0;
        }

        const yearlyPayment = userData.monthlyPayment * 12;
        const variableCosts = yearlyPayment - userData.basePrice;
        const monthlyVariableCosts = variableCosts / 12;
        const consumptionGoal = monthlyVariableCosts / userData.workingPrice;
        return Math.round(consumptionGoal);
    }

    console.log(userData)

    const form = useForm<z.infer<typeof userGoalSchema>>({
        resolver: zodResolver(userGoalSchema),
        defaultValues: {
            goalValue: goalCalculated ? calculateGoal(userData) : userData?.consumptionGoal ?? 0
        }
    });

    const { handleNextClick, handleStep } = useWizard();

    handleNextClick(async (onSuccess) => {
        await form.handleSubmit(async () => {
            await onSuccess();
        })();
    });

    handleStep(async () => {
        const data: z.infer<typeof userGoalSchema> = form.getValues();
        await updateUserGoals(data);
    });

    return (
        <WizardPage title="Ziel">
            <Form {...form}>
                <form className="flex flex-col gap-4">
                    <UserGoalsFormFields form={form} goalIsCalculated={goalCalculated} />
                </form>
            </Form>
        </WizardPage>
    )
}

function ThankYouStep() {
    return (
        <WizardPage title="Vielen Dank!">
            Danke, dass Sie uns die nötigen Daten zur Verfügung gestellt haben! Sie können die App nun in vollem Umfang
            nutzen.
        </WizardPage>
    );
}