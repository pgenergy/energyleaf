"use client";

import { PanelLeftOpenIcon, PanelRightOpenIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";

export default function NavButton() {
	const { setOpen, setOpenMobile, open, openMobile, isMobile } = useSidebar();

	function handleClick() {
		if (isMobile) {
			setOpenMobile(!openMobile);
		} else {
			setOpen(!open);
		}
	}

	return (
		<Button variant="ghost" onClick={handleClick} className="cursor-pointer">
			{(!isMobile && open) || (isMobile && openMobile) ? (
				<PanelRightOpenIcon className="size-5" />
			) : (
				<PanelLeftOpenIcon className="size-5" />
			)}
		</Button>
	);
}
