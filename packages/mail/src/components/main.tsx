import { ReactElement } from "react";
import { Body, Container, Tailwind } from "@react-email/components";

import config from "@energyleaf/tailwindcss/mail-config";

interface Props {
    children: ReactElement[];
}

export function Main({ children }: Props) {
    return (
        <Tailwind
            config={{
                ...config,
            }}
        >
            <Body className="bg-background font-sans text-foreground">
                <Container className="mx-auto flex max-w-xl flex-col gap-4 px-8 py-4">{children}</Container>
            </Body>
        </Tailwind>
    );
}
