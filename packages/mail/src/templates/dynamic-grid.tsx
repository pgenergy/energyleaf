import { Column, Row } from "@react-email/components";
import type { ReactElement, ReactNode } from "react";

interface Props {
    children: ReactElement[];
    maxColumns: number;
}

/**
 * A component that basically represents the "flex-col" class in Tailwind CSS. Unfortunately, this class is not well supported in some email clients
 * like Gmail.
 */
export default function DynamicGrid({ children, maxColumns }: Props) {
    const rowParts: ReactElement[][] = [];
    for (let i = 0; i < children.length; i += maxColumns) {
        const chunk = children.slice(i, i + maxColumns);
        rowParts.push(chunk);
    }

    const content = () =>
        rowParts.map(
            (row, rowIndex) =>
                (
                    <Row key={rowIndex.toString()} className="pb-2">
                        {row.map((child, columnIndex) => (
                            <Column className={`w-${12 / maxColumns} p-1`} key={columnIndex.toString()}>
                                {child}
                            </Column>
                        ))}
                    </Row>
                ) as ReactNode,
        );

    return content();
}
