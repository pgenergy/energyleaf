import { cn } from "@energyleaf/tailwindcss/utils";

interface Props {
    className?: string;
}

export default function HeatPump({ className }: Props) {
    return <span className={cn("icon-[material-symbols--heat-pump-outline]", className)} />;
}
