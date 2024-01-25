import type {UserTableType} from "@/components/users/table/users-table-columns";
import React from "react";
import {InfoIcon} from "lucide-react";
import {useRouter} from "next/navigation";

interface Props {
    user: UserTableType;
}

export default function UserDetailsButton({user}: Props) {
    const router = useRouter()
    function openDetails() {
        router.push(`/users/${user.id}`)
    }

    return (
        <InfoIcon cursor="pointer" onClick={openDetails}/>
    );
}