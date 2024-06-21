import UserConsumptionCard from "@/components/users/details/consumption/user-consumption-card";
import { UserConsumptionCardError } from "@/components/users/details/consumption/user-consumption-card-error";
import UserActionsCard from "@/components/users/details/user-actions-card";
import UserDangerActionsCard from "@/components/users/details/user-danger-actions";
import UserDetailsDeleteDialog from "@/components/users/details/user-details-delete-dialog";
import UserInformationCard from "@/components/users/details/user-information-card";
import UserOnboardingCard from "@/components/users/details/user-onboarding-card";
import UserOnboardingCardError from "@/components/users/details/user-onboarding-card-error";
import { UserResetPasswordDialog } from "@/components/users/details/user-reset-password-dialog";
import UserSensorsCard from "@/components/users/details/user-sensors-card";
import UserSensorsCardError from "@/components/users/details/user-sensors-card-error";
import { UserContextProvider } from "@/hooks/user-hook";
import { getUserById } from "@/query/user";
import { ErrorBoundary } from "@energyleaf/ui/error";
import { Skeleton } from "@energyleaf/ui/skeleton";
import { Suspense } from "react";

export const metadata = {
    title: "Nutzerdetails | Energyleaf Admin",
};

interface Props {
    params: {
        id: string;
    };
}

export default async function UserDetailsPage({ params }: Props) {
    const user = await getUserById(params.id);

    if (!user) {
        return <p>Nutzer nicht gefunden</p>;
    }

    // Clear password before rendering
    user.password = "";

    return (
        <UserContextProvider>
            <UserDetailsDeleteDialog />
            <UserResetPasswordDialog />
            <div className="flex flex-col gap-4">
                <UserInformationCard user={user} />
                <ErrorBoundary fallback={UserOnboardingCardError}>
                    <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                        <UserOnboardingCard userId={user.id} />
                    </Suspense>
                </ErrorBoundary>
                <UserActionsCard userId={user.id} />
                <ErrorBoundary fallback={UserSensorsCardError}>
                    <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                        <UserSensorsCard userId={user.id} />
                    </Suspense>
                </ErrorBoundary>
                <ErrorBoundary fallback={UserConsumptionCardError}>
                    <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                        <UserConsumptionCard userId={user.id} />
                    </Suspense>
                </ErrorBoundary>
                <UserDangerActionsCard user={user} />
            </div>
        </UserContextProvider>
    );
}
