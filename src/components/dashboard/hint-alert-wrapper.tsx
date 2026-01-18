import { endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek, subDays, subWeeks } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { TimeZoneType, TimezoneTypeToTimeZone } from "@/lib/enums";
import { HintType, type HintTypeValue } from "@/lib/hints";
import { getCurrentSession } from "@/server/lib/auth";
import { getTodayHint } from "@/server/queries/hints";
import { HintAlert } from "./hint-alert";

const DAILY_HINT_TYPES = new Set<HintTypeValue>([
	HintType.SIMPLE_TOTAL_CONSUMPTION,
	HintType.SIMPLE_CONSUMPTION_COST,
	HintType.SIMPLE_LOWEST_HOUR,
	HintType.SIMPLE_HIGHEST_HOUR,
	HintType.SIMPLE_PERCENT_CHANGE,
	HintType.SIMPLE_KWH_CHANGE,
	HintType.INTERMEDIATE_PEAK_SPIKE,
	HintType.INTERMEDIATE_PEAK_VS_AVG,
	HintType.INTERMEDIATE_PEAK_VS_LOWEST,
	HintType.EXPERT_HIGH_USE_PERIOD,
	HintType.EXPERT_PERIOD_PERCENTAGE,
	HintType.EXPERT_PERIOD_VS_AVG,
	HintType.EXPERT_DEVICE_USAGE,
]);

const WEEKLY_HINT_TYPES = new Set<HintTypeValue>([
	HintType.INTERMEDIATE_WEEK_COMPARISON,
	HintType.INTERMEDIATE_WEEKEND_VS_WEEKDAY,
]);

const MONTHLY_HINT_TYPES = new Set<HintTypeValue>([HintType.SIMPLE_MONTH_PREDICTION]);

function buildHintLinkTarget(
	linkTarget: string,
	hintType: HintTypeValue,
	forDate: Date,
	timezone: string | null | undefined,
): string {
	const tz = TimezoneTypeToTimeZone[timezone as TimeZoneType] || TimezoneTypeToTimeZone[TimeZoneType.Europe_Berlin];
	const hintDay = startOfDay(toZonedTime(forDate, tz));

	if (DAILY_HINT_TYPES.has(hintType)) {
		const queryDate = subDays(hintDay, 1);
		if (linkTarget === "/peaks") {
			const start = startOfWeek(queryDate, { weekStartsOn: 1 }).toISOString();
			const end = endOfWeek(queryDate, { weekStartsOn: 1 }).toISOString();
			return `${linkTarget}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
		}
		return `${linkTarget}?date=${encodeURIComponent(queryDate.toISOString())}`;
	}

	if (WEEKLY_HINT_TYPES.has(hintType)) {
		const weekDate = subWeeks(hintDay, 1);
		const start = startOfWeek(weekDate, { weekStartsOn: 1 }).toISOString();
		const end = endOfWeek(weekDate, { weekStartsOn: 1 }).toISOString();
		const weekTarget = linkTarget === "/peaks" ? linkTarget : `${linkTarget}/week`;
		return `${weekTarget}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
	}

	if (MONTHLY_HINT_TYPES.has(hintType)) {
		const start = startOfMonth(hintDay).toISOString();
		const end = endOfMonth(hintDay).toISOString();
		const monthTarget = linkTarget === "/peaks" ? linkTarget : `${linkTarget}/month`;
		return `${monthTarget}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
	}

	return linkTarget;
}

export async function HintAlertWrapper() {
	const { user } = await getCurrentSession();
	if (!user) {
		return null;
	}

	const hint = await getTodayHint(user.id);
	if (!hint) {
		return null;
	}

	const hintType = hint.hintType as HintTypeValue;
	const linkTarget = buildHintLinkTarget(hint.linkTarget, hintType, hint.forDate, user.timezone);

	return (
		<HintAlert
			hint={{
				id: hint.id,
				hintText: hint.hintText,
				linkTarget,
			}}
		/>
	);
}
