import { Container } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

interface Props {
    children: ReactNode;
    heading: string;
    icon?: ReactElement;
}

export default function Card({ children, heading, icon }: Props) {
    return (
        <div className="flex flex-col items-center rounded bg-muted p-2">
            {icon}
            <h4 className="text-center">{heading}</h4>
            {children}
        </div>
    );
}
