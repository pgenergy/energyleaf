import { Suspense } from "react";
import { getUser } from "@/actions/user";
import UserActionsCard from "@/components/users/details/user-actions-card";
import UserDetailsDeleteDialog from "@/components/users/details/user-details-delete-dialog";
import UserInformationCard from "@/components/users/details/user-information-card";
import { UserResetPasswordDialog } from "@/components/users/details/user-reset-password-dialog";
import UserSensorsCard from "@/components/users/details/user-sensors-card";
import { UserDetailsContextProvider } from "@/hooks/user-detail-hook";

import { Skeleton } from "@energyleaf/ui";

interface Props {
    params: {
        id: string;
    };
}

export default async function UserDetailsPage({ params }: Props) {
    const user = await getUser(params.id);
    if (!user) {
        return <p>Nutzer nicht gefunden</p>;
    }

    // Clear password before rendering
    user.password = "";

    return (
        <UserDetailsContextProvider>
            <UserDetailsDeleteDialog />
            <UserResetPasswordDialog />
            <div className="flex flex-col gap-4">
                <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                    <UserInformationCard user={user} />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                    <UserActionsCard user={user} />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-[57rem] w-full" />}>
                    <UserSensorsCard userId={user.id} />
                </Suspense>
            </div>
        </UserDetailsContextProvider>
    );
}
