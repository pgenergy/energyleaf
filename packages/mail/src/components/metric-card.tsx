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
                <div className="flex flex-col items-center pt-3 text-xs">
                    <TrendIcon mode={lastReportInfo.mode} size={20} />
                    <span className="font-semibold">Vorheriger Bericht:</span>
                    <span>{lastReportInfo.lastReportElement()}</span>
                </div>
            )}
        </Card>
    );
}
