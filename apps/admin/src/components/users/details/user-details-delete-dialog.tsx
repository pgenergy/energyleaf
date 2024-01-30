"use client";

import {useUserDetailsContext} from "@/hooks/user-detail-hook";
import {UserDeleteDialog} from "@/components/users/user-delete-dialog";
import {useRouter} from "next/navigation";

export default function UserDetailsDeleteDialog() {
    const context = useUserDetailsContext();
    const router = useRouter()

    function onSuccess() {
        router.push(`/users`)
    }

    return <UserDeleteDialog context={context} onSuccess={onSuccess}/>;
}