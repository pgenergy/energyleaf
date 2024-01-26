"use client";

import {useParams} from "next/navigation";
import UserInformationCard from "@/components/users/user-information-card";
import UserActionsCard from "@/components/users/user-actions-card";
import {Skeleton} from "@energyleaf/ui";
import {Suspense} from "react";
import UserSensorsCard from "@/components/user-sensors-card";

export default function UserDetailsPage() {
    const { id } = useParams<{ id: string }>();
    return (
        <div className="flex flex-col gap-4">
            <Suspense fallback={<Skeleton className="h-[57rem] w-full"/>}>
                <UserInformationCard/>
            </Suspense>
            <Suspense fallback={<Skeleton className="h-[57rem] w-full"/>}>
                <UserSensorsCard/>
            </Suspense>
            <Suspense fallback={<Skeleton className="h-[57rem] w-full"/>}>
                <UserActionsCard/>
            </Suspense>
        </div>
    );
}