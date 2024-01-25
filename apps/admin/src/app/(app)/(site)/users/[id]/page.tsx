"use client";

import {useParams} from "next/navigation";

export default function UserDetailsPage() {
    const { id } = useParams<{ id: string }>();
    return <p>{id}</p>;
}