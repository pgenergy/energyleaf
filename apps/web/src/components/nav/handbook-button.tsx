"use client";

import { BookIcon } from "lucide-react";

interface Props {
    endpoint: string;
}

export default function HandbookButton({ endpoint }: Props) {
    return (
        <a href={endpoint}>
            <BookIcon className="h-6 w-6" />
        </a>
    );
}
