import { Container, Heading, Hr, Img, Link, Text } from "@react-email/components";
import React, { type ReactElement } from "react";

interface Props {
    visible: boolean;
    icon: ReactElement | null;
    heading: string;
    children: ReactElement;
    large: boolean;
}

export default function Tile({ visible, large, icon, heading, children }: Props) {
    if (!visible) {
        return null;
    }

    return (
        <div>
            <Container className="flex flex-row justify-center">
                {icon}
            </Container>
            <h3 className="m-1 flex flex-row justify-center">{heading}</h3>
            <div className="m-2 flex flex-row justify-center font-semibold text-xl">{children}</div>
        </div>
    );
}
