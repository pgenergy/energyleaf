"use client";

import { Button } from "@energyleaf/ui/button";
import { useSidebar } from "@energyleaf/ui/sidebar";
import { PanelLeftOpenIcon, PanelRightOpenIcon } from "lucide-react";

export default function MobileSidebarButton() {
    const { isMobile, toggleSidebar, open } = useSidebar();
    if (!isMobile) {
        return null;
    }

    return (
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {open ? <PanelRightOpenIcon className="h-5 w-5" /> : <PanelLeftOpenIcon className="h-5 w-5" />}
        </Button>
    );
}
