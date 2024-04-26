import { Container, Heading, Hr, Img, Link, Text } from "@react-email/components";
import React, { type ReactElement } from "react";

interface Props {
    visible: boolean;
    icon: ReactElement | null;
    heading: string;
    children: ReactElement | string | number;
    large: boolean;
}

export default function Tile({ visible, large, icon, heading, children }: Props) {
    if (!visible) {
        return <div className="hidden" />;
    }

    const el = (
        <div>
            <Container className="flex flex-row justify-center">
                {icon ? React.cloneElement(icon, { className: "text-primary h-16 w-16" }) : ""}
            </Container>
            <Heading as="h3" className="m-1 flex flex-row justify-center">
                {heading}
            </Heading>
            <div className="m-2 flex flex-row justify-center font-semibold text-xl">{children}</div>
        </div>
    );

    return React.cloneElement(el, {
        className: `bg-muted rounded px-4 pt-4 pb-2 ${large ? "basis-full" : "basis-5/12"}`,
    });
}
