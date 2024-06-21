import type { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

export default function Centering({ children }: Props) {
    return <div className="text-center">{children}</div>;
}
