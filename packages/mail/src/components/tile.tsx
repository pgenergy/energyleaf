import React, { type ReactElement } from "react";

interface Props {
    visible?: boolean;
    heading: string;
    children: ReactElement;
}

export default function Tile({ visible, heading, children }: Props) {
    const isVisible = visible ?? true;
    if (!isVisible) {
        return null;
    }

    return (
        <div>
            <h3 className="flex flex-row justify-center">{heading}</h3>
            <div className="m-2 flex flex-row justify-center">{children}</div>
        </div>
    );
}
