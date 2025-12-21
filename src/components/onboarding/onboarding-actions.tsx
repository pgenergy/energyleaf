"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { completeOnboardingAction } from "@/server/actions/onboarding";

export default function OnboardingActions() {
	const [pending, startTransition] = useTransition();
	const router = useRouter();

	function handleComplete() {
		startTransition(async () => {
			const res = await completeOnboardingAction();
			if (res.success) {
				toast.success(res.message);
				router.push(res.path || "/dashboard");
			} else {
				toast.error(res.message);
			}
		});
	}

	return (
		<div className="flex flex-row justify-end gap-4">
			<Button variant="outline" onClick={handleComplete} disabled={pending} className="cursor-pointer">
				Überspringen
			</Button>
			<Button onClick={handleComplete} disabled={pending} className="cursor-pointer">
				{pending ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
				Onboarding abschließen
			</Button>
		</div>
	);
}
