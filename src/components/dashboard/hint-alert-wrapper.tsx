import { getCurrentSession } from "@/server/lib/auth";
import { getTodayHint } from "@/server/queries/hints";
import { HintAlert } from "./hint-alert";

export async function HintAlertWrapper() {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const hint = await getTodayHint(user.id);
	if (!hint) {
		return null;
	}

	return (
		<HintAlert
			hint={{
				id: hint.id,
				hintText: hint.hintText,
				linkTarget: hint.linkTarget,
			}}
		/>
	);
}
