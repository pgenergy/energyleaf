import { Container, Heading, Section } from "@react-email/components";
import React, { type ReactNode, type ReactElement } from "react";
import Centering from "./centering";

interface Props {
    visible?: boolean;
    heading: string;
    children: ReactNode;
}

export default function Tile({ visible, heading, children }: Props) {
    const isVisible = visible ?? true;
    if (!isVisible) {
        return null;
    }

    return (
        <Centering>
            <Heading as="h3">{heading}</Heading>
            {children}
        </Centering>
    );
}
