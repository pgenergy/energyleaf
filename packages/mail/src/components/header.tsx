import {Container, Heading, Hr, Img, Link} from "@react-email/components";
import React, {ReactElement} from "react";
import * as process from "process";

interface Props {
    children: string;
}

const baseUrl = "https://energyleaf.de";

export function Header({children}: Props) {
    return (
        <Container>
            <Container className="flex flex-row-reverse">
                <Link href={baseUrl} className="">
                    <Img src={`${baseUrl}/_next/image?url=%2Fimage%2Flogo%2Flogo_text.png&w=1080&q=75`}
                         height="72" alt="Energyleaf Logo"/>
                </Link>
            </Container>
            <h2>{children}</h2>
            <Hr className="border border-border"/>
        </Container>
    );
}