import { Column, Row } from "@react-email/components";
import type { ReactElement } from "react";

interface Props {
    children: ReactElement[];
}

/**
 * A row with two columns, each taking up half the width of the row.
 *
 * @remarks Using the "grid-cols-2" class in Tailwind CSS is not well supported in some email clients like Gmail.
 */
export default function HalfRow({ children }: Props) {
    if (children.length !== 2) {
        throw new Error("HalfRow requires exactly two children");
    }

    return (
        <Row className="pb-2">
            {children.map((child, index) => (
                <Column className="w-1/2 p-1" key={index.toString()}>
                    {child}
                </Column>
            ))}
        </Row>
    );
}
