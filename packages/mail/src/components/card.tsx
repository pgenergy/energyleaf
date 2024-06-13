import { Container, Heading, Section } from "@react-email/components";
import type { ReactElement, ReactNode } from "react";

interface Props {
    children: ReactNode;
    heading: string;
    icon?: ReactElement;
}

export default function Card({ children, heading, icon }: Props) {
    return (
        <Container className="rounded bg-muted p-2 text-center">
            {icon}
            <Heading as="h4">{heading}</Heading>
            <Section>{children}</Section>
        </Container>
    );
}
