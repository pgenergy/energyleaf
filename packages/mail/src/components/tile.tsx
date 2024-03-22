import {Container, Heading, Hr, Img, Link, Text} from "@react-email/components";
import React, {ReactElement} from "react";

interface Props {
    visible: boolean;
    icon: ReactElement;
    heading: string;
    children: ReactElement;
    large: boolean;
}

export default function Tile({ visible, large, icon, heading, children } : Props) {
    if (!visible) {
        return <div className="hidden" />;
    }

    const el = (
        <div>
            <Container className="flex flex-row justify-center">
                {icon ? React.cloneElement(icon, { className: "text-primary h-16 w-16" }) : ""}
            </Container>
            <Heading as="h3" className="flex flex-row justify-center m-1">
                {heading}
            </Heading>
            <div className="text-xl font-semibold flex flex-row justify-center m-2">
                {children}
            </div>
        </div>
    );

    return React.cloneElement(el, { className: `bg-muted rounded px-4 pt-4 pb-2 ${large ? "basis-full" : "basis-5/12"}` });
}
