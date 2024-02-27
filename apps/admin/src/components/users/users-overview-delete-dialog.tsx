"use client";

import { UserDeleteDialog } from "@/components/users/user-delete-dialog";
import { useUserContext } from "@/hooks/user-hook";

export default function UsersOverviewDeleteDialog() {
    const context = useUserContext();
    return <UserDeleteDialog context={context} />;
}
