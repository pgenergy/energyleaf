"use client";

import { completeOnboarding } from "@/actions/onboarding";
import { updateMailInformation, updateUserDataInformation, updateUserGoals } from "@/actions/profile";
import DataFormFields from "@/components/settings/data-form-fields";
import MailSettingsFormFields from "@/components/settings/mail-settings-form-fields";
import UserGoalsFormFields from "@/components/settings/user-goals-form-fields";
import { createMailSettingsSchema, createUserDataSchemaFromUserDataSelectType } from "@/lib/schema/conversion/profile";
import { mailSettingsSchema, userDataSchema, userGoalSchema } from "@/lib/schema/profile";
import type { DefaultActionReturn } from "@energyleaf/lib";
import type { MailConfig, UserDataSelectType } from "@energyleaf/postgres/types";
import { Button } from "@energyleaf/ui/button";
import { Form } from "@energyleaf/ui/form";
import { Wizard, WizardPage, useWizard } from "@energyleaf/ui/wizard";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon } from "lucide-react";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

interface Props {
    userData: UserDataSelectType;
    mailConfig: MailConfig;
    showGoals: boolean;
}

export default function OnboardingWizard({ userData, mailConfig, showGoals }: Props) {
    async function completeOnboardingCallback() {
        let res: DefaultActionReturn = undefined;

        try {
            res = await completeOnboarding();
        } catch (err) {
            throw new Error("Ein Fehler ist aufgetreten.");
        }

        if (res && !res?.success) {
            throw new Error(res?.message);
        }
    }

    function finishHandler() {
        toast.promise(completeOnboardingCallback, {
            loading: "Schließe Onboarding ab...",
            success: "Onboarding abgeschlossen",
            error: (err: Error) => err.message,
        });
    }

    return (
        <Wizard finishHandler={finishHandler}>
            <InformationStep />
            <UserDataStep userData={userData} />
            {Boolean(showGoals) && <GoalStep userData={userData} />}
            <MailSettingsStep mailConfig={mailConfig} />
            <ThankYouStep />
        </Wizard>
    );
}

function InformationStep() {
    function onSkip() {
        toast.promise(completeOnboarding(), {
            loading: "Überspringe Onboarding...",
            success: "Onboarding übersprungen",
            error: "Fehler beim Überspringen des Onboardings",
        });
    }

    return (
        <WizardPage title="Onboarding">
            <p className="text-sm">
                Um die App in vollem Umfang nutzen zu können, sollten Sie die in den folgenden Schritten geforderten
                Daten angeben. Sie können diese Angaben und Einstellungen später in den Einstellungen aktualisieren.
            </p>
            <div className="flex w-full justify-center pt-3">
                <Button
                    className="flex flex-row items-center justify-center gap-2 text-muted-foreground text-sm"
                    variant="ghost"
                    onClick={onSkip}
                >
                    Überspringen
                    <ArrowRightIcon className="h-4 w-4" />
                </Button>
            </div>
        </WizardPage>
    );
}

interface UserDataStepProps {
    userData: UserDataSelectType;
}

function UserDataStep({ userData }: UserDataStepProps) {
    const form = useForm<z.infer<typeof userDataSchema>>({
        resolver: zodResolver(userDataSchema),
        defaultValues: createUserDataSchemaFromUserDataSelectType(userData),
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
                <form className="flex flex-col gap-4 md:grid md:grid-cols-2">
                    <DataFormFields form={form} />
                </form>
            </Form>
        </WizardPage>
    );
}

function GoalStep({ userData }: UserDataStepProps) {
    const goalCalculated = useMemo(() => {
        return !userData.consumptionGoal;
    }, [userData.consumptionGoal]);

    const calculateGoal = useCallback(() => {
        if (!userData.monthlyPayment || !userData.basePrice || !userData.workingPrice) {
            return 0;
        }

        const yearlyPayment = userData.monthlyPayment * 12;
        const variableCosts = yearlyPayment - userData.basePrice;
        const monthlyVariableCosts = variableCosts / 12;
        const consumptionGoal = monthlyVariableCosts / userData.workingPrice;
        return Math.round(consumptionGoal);
    }, [userData.monthlyPayment, userData.basePrice, userData.workingPrice]);

    const form = useForm<z.infer<typeof userGoalSchema>>({
        resolver: zodResolver(userGoalSchema),
        defaultValues: {
            goalValue: goalCalculated ? calculateGoal() : (userData.consumptionGoal ?? 0),
        },
    });

    // Sometimes, the goal value is calculated with outdated data and not updated. To fix this issue, update the goal
    // value manually.
    // biome-ignore lint/correctness/useExhaustiveDependencies: we only care about isDirty
    useEffect(() => {
        if (!form.formState.isDirty) {
            form.setValue("goalValue", calculateGoal());
        }
    }, [form.formState.isDirty]);

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
                    <UserGoalsFormFields
                        form={form}
                        goalIsCalculated={goalCalculated}
                        workingPrice={userData.workingPrice}
                    />
                </form>
            </Form>
        </WizardPage>
    );
}

interface MailSettingsStepProps {
    mailConfig: MailConfig;
}

function MailSettingsStep({ mailConfig }: MailSettingsStepProps) {
    const form = useForm<z.infer<typeof mailSettingsSchema>>({
        resolver: zodResolver(mailSettingsSchema),
        defaultValues: createMailSettingsSchema(mailConfig),
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
            description="Wir beabsichtigen, Sie über Ihren Verbrauch zu informieren, indem wir regelmäßige Berichte in
            Form von E-Mails zusenden. Hier können Sie einstellen, ob und wann Sie diese Berichte erhalten möchten."
        >
            <Form {...form}>
                <form className="flex flex-col gap-4 pt-4">
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
