import { Suspense } from "react";
import { redirect } from "next/navigation";
import ErrorBoundary from "@/components/error/error-boundary";
import AccountDeletionForm from "@/components/profile/account-deletion-form";
import AccountDeletionError from "@/components/profile/account-deletion-form-error";
import BaseInformationForm from "@/components/profile/base-information-form";
import BaseInformationError from "@/components/profile/base-information-form-error";
import UserDataForm from "@/components/profile/data-form";
import UserDataError from "@/components/profile/data-form-error";
import MailSettingsForm from "@/components/profile/mail-settings-form";
import MailSettingsError from "@/components/profile/mail-settings-form-error";
import { getSession } from "@/lib/auth/auth";
import { isDemoUser } from "@/lib/demo/demo";
import { getUserData } from "@/query/user";

import { Skeleton } from "@energyleaf/ui";

export default async function ProfilePage() {
    const session = await getSession();

    if (!session?.user.id || !session.user.email || !session.user.name) {
        redirect("/");
    }

    const isDemo = await isDemoUser();

    const userData = await getUserData(session.user.id);
    const data = {
        houseType: userData?.user_data.property || "house",
        livingSpace: userData?.user_data.livingSpace || 0,
        people: userData?.user_data.household || 0,
        hotWater: userData?.user_data.hotWater || "electric",
        budget: userData?.user_data.budget || 0,
        tariff: userData?.user_data.tariff || "basic",
        basePrice: userData?.user_data.basePrice || 0,
        monthlyPayment: userData?.user_data.monthlyPayment || 0,
    };

    return (
        <div className="flex flex-col gap-4">
            <ErrorBoundary fallback={BaseInformationError}>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <BaseInformationForm disabled={isDemo} email={session.user.email} username={session.user.name} />
                </Suspense>
            </ErrorBoundary>
            <ErrorBoundary fallback={MailSettingsError}>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <MailSettingsForm
                        daily={userData?.mail.mailDaily || false}
                        disabled={isDemo}
                        weekly={userData?.mail.mailWeekly || false}
                    />
                </Suspense>
            </ErrorBoundary>
            <ErrorBoundary fallback={UserDataError}>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <UserDataForm disabled={isDemo} initialData={data} />
                </Suspense>
            </ErrorBoundary>
            <ErrorBoundary fallback={AccountDeletionError}>
                <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                    <AccountDeletionForm disabled={isDemo} />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
