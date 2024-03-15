"use client";

import { useRouter } from "next/navigation";
import { UserDeleteDialog } from "@/components/users/user-delete-dialog";

export default function UserDetailsDeleteDialog() {
    const router = useRouter();

    function onSuccess() {
        router.push(`/users`);
    }

    return <UserDeleteDialog onSuccess={onSuccess} />;
}
