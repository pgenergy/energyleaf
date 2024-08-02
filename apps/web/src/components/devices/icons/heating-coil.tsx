import { cn } from "@energyleaf/tailwindcss/utils";

interface Props {
    className?: string;
}

export default function HeatingCoil({ className }: Props) {
    return <span className={cn("icon-[mdi--heating-coil]", className)} />;
}
