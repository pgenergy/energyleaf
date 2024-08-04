import { cn } from "@energyleaf/tailwindcss/utils";

interface Props {
    className?: string;
}

export default function Fryer({ className }: Props) {
    return <span className={cn("icon-[mdi--oven]", className)} />;
}
