import { cn } from "@energyleaf/tailwindcss/utils";

interface Props {
    className?: string;
}

export default function VacuumCleaner({ className }: Props) {
    return <span className={cn("icon-[icon-park-outline--vacuum-cleaner]", className)} />;
}
