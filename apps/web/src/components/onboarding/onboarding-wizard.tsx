"use client";

import {Button, Form, useWizard, Wizard, WizardPage} from "@energyleaf/ui";
import {completeOnboarding} from "@/actions/onboarding";
import React, {useCallback, useMemo} from "react";
import {ArrowRightIcon} from "lucide-react";
import {useForm} from "react-hook-form";
import type {z} from "zod";
import {mailSettingsSchema, userDataSchema, userGoalSchema} from "@/lib/schema/profile";
import {zodResolver} from "@hookform/resolvers/zod";
import UserGoalsFormFields from "@/components/profile/user-goals-form-fields";
import type {ReportSelectType, UserDataSelectType, UserDataType} from "@energyleaf/db/types";
import {updateMailInformation, updateUserDataInformation, updateUserGoals} from "@/actions/profile";
import {toast} from "sonner";
import DataFormFields from "@/components/profile/data-form-fields";
import MailSettingsFormFields from "@/components/profile/mail-settings-form-fields";
import {reports} from "@energyleaf/db/schema";

interface Props {
    userData: UserDataType;
}

export default function OnboardingWizard({userData}: Props) {
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
            <UserDataStep userData={userData.user_data} />
            <GoalStep userData={userData.user_data} />
            <MailSettingsStep reports={userData.reports} />
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

interface UserDataStepProps {
    userData: UserDataSelectType;
}

function UserDataStep({userData}: UserDataStepProps) {
    const form = useForm<z.infer<typeof userDataSchema>>({
        resolver: zodResolver(userDataSchema),
        defaultValues: {
            // TODO: In eigene Methode auslagern? Wird im Profil auch verwendet...
            houseType: userData.property ?? "house",
            livingSpace: userData.livingSpace ?? 0,
            people: userData.household ?? 0,
            hotWater: userData.hotWater ?? "electric",
            tariff: userData.tariff ?? "basic",
            basePrice: userData.basePrice ?? 0,
            workingPrice: userData.workingPrice ?? 0,
            monthlyPayment: userData.monthlyPayment ?? 0,
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

function GoalStep({userData}: UserDataStepProps) {
    const goalCalculated = useMemo(() => {
        return !userData.consumptionGoal;
    }, [userData]);

    const calculateGoal = useCallback(() => {
        if (!userData.monthlyPayment || !userData.basePrice || !userData.workingPrice) {
            return 0;
        }

        const yearlyPayment = userData.monthlyPayment * 12;
        const variableCosts = yearlyPayment - userData.basePrice;
        const monthlyVariableCosts = variableCosts / 12;
        const consumptionGoal = monthlyVariableCosts / userData.workingPrice;
        return Math.round(consumptionGoal);

    }, [userData]);

    const form = useForm<z.infer<typeof userGoalSchema>>({
        resolver: zodResolver(userGoalSchema),
        defaultValues: {
            goalValue: goalCalculated ? calculateGoal() : userData.consumptionGoal ?? 0
        }
    });

    // Sometimes, the goal value is calculated with outdated data and not updated. To fix this issue, update the goal
    // value manually.
    if (!form.formState.isDirty) {
        form.setValue("goalValue", calculateGoal());
    }

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

interface MailSettingsStepProps {
    reports: ReportSelectType;
}

function MailSettingsStep({reports}: MailSettingsStepProps) {
    const form = useForm<z.infer<typeof mailSettingsSchema>>({
        resolver: zodResolver(mailSettingsSchema),
        defaultValues: {
            interval:reports.interval || 3,
            receiveMails: reports.receiveMails || false,
            time:reports.time || 6
        },
    });

    const { handleNextClick, handleStep } = useWizard();

    handleNextClick(async (onSuccess) => {
        await form.handleSubmit(async () => {
            await onSuccess();
        })();
    });

    handleStep(async () => {
        const data: z.infer<typeof mailSettingsSchema> = form.getValues();
        await updateMailInformation(data);
    });

    return (
        <WizardPage
            title="E-Mail & Berichte"
            description="Um Sie über Ihren Verbrauch informieren zu können, möchten wir Ihnen gerne Berichte in Form von
            E-Mails senden. Hier können Sie einstellen, ob und wann Sie diese Berichte erhalten möchten. Sie können Ihre
            Zustimmung jederzeit im Profil oder über die E-Mails widerrufen."
        >
            <Form {...form}>
                <form className="flex flex-col gap-4 pt-3">
                    <MailSettingsFormFields form={form} />
                </form>
            </Form>
        </WizardPage>
    );

}

function ThankYouStep() {
    return (
        <WizardPage title="Vielen Dank!">
            Danke, dass Sie uns die nötigen Daten zur Verfügung gestellt haben! Sie können die App nun in vollem Umfang
            nutzen.
        </WizardPage>
    );
}