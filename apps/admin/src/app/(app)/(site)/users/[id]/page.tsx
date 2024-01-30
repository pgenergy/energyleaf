import UserInformationCard from "@/components/users/user-information-card";
import UserActionsCard from "@/components/users/user-actions-card";
import {Skeleton} from "@energyleaf/ui";
import {Suspense} from "react";
import UserSensorsCard from "@/components/user-sensors-card";
import {getUser} from "@/actions/user";

interface Props {
    params: {
        id: string;
    }
}

export default async function UserDetailsPage({ params }: Props) {
    const user = await getUser(Number(params.id));
    if (!user) {
        return <p>Nutzer nicht gefunden</p>;
    }

    return (
        <div className="flex flex-col gap-4">
            <Suspense fallback={<Skeleton className="h-[57rem] w-full"/>}>
                <UserInformationCard user={user}/>
            </Suspense>
            <Suspense fallback={<Skeleton className="h-[57rem] w-full"/>}>
                <UserSensorsCard/>
            </Suspense>
            <Suspense fallback={<Skeleton className="h-[57rem] w-full"/>}>
                <UserActionsCard user={user}/>
            </Suspense>
        </div>
    );
}