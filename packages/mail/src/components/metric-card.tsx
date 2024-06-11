import { Row, Section } from "@react-email/components";
import type { ReactElement, ReactNode } from "react";
import type { TrendModes } from "../types/trend-modes";
import Card from "./card";
import { TrendIcon } from "./tend-icon";

interface Props {
    heading: string;
    icon: ReactElement;
    children: ReactNode;
    lastReportInfo?: {
        mode: TrendModes;
        lastReportElement: () => ReactNode;
    };
}

export default function MetricCard({ heading, icon, children, lastReportInfo }: Props) {
    return (
        <Card heading={heading} icon={icon}>
            <span>{children}</span>
            {lastReportInfo && (
                <Section className="pt-3 text-xs">
                    <Row>
                        <TrendIcon mode={lastReportInfo.mode} size={20} />
                    </Row>
                    <Row className="font-semibold">Vorheriger Bericht:</Row>
                    <Row>{lastReportInfo.lastReportElement()}</Row>
                </Section>
            )}
        </Card>
    );
}
