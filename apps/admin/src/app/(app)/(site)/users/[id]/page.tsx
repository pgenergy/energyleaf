import { Suspense } from "react";
import UserActionsCard, { UserActionsCardError } from "@/components/users/details/user-actions-card";
import UserDetailsDeleteDialog from "@/components/users/details/user-details-delete-dialog";
import UserInformationCard, { UserInformationCardError } from "@/components/users/details/user-information-card";
import { UserResetPasswordDialog } from "@/components/users/details/user-reset-password-dialog";
import UserSensorsCard from "@/components/users/details/user-sensors-card";
import UserSensorsCardError from "@/components/users/details/user-sensors-card-error";
import { UserContextProvider } from "@/hooks/user-hook";
import { getUserById } from "@/query/user";

import { Skeleton } from "@energyleaf/ui";
import { ErrorBoundary } from "@energyleaf/ui/error";

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
                <ErrorBoundary fallback={UserInformationCardError}>
                    <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                        <UserInformationCard user={user} />
                    </Suspense>
                </ErrorBoundary>
                <ErrorBoundary fallback={UserActionsCardError}>
                    <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                        <UserActionsCard user={user} />
                    </Suspense>
                </ErrorBoundary>
                <ErrorBoundary fallback={UserSensorsCardError}>
                    <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                        <UserSensorsCard userId={user.id} />
                    </Suspense>
                </ErrorBoundary>
            </div>
        </UserContextProvider>
    );
}
