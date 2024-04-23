"use client";

import { UserDeleteDialog } from "@/components/users/user-delete-dialog";
import { useRouter } from "next/navigation";

export default function UserDetailsDeleteDialog() {
    const router = useRouter();

    function onSuccess() {
        router.push("/users");
    }

    return <UserDeleteDialog onSuccess={onSuccess} />;
}
