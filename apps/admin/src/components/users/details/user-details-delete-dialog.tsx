"use client";

import { useRouter } from "next/navigation";
import { UserDeleteDialog } from "@/components/users/user-delete-dialog";
import { useUserDetailsContext } from "@/hooks/user-detail-hook";

export default function UserDetailsDeleteDialog() {
    const context = useUserDetailsContext();
    const router = useRouter();

    function onSuccess() {
        router.push(`/users`);
    }

    return <UserDeleteDialog context={context} onSuccess={onSuccess} />;
}
