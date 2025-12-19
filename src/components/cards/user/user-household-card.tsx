import { HomeIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HouseTypeDisplay, type HouseTypeValue, WaterTypeDisplay, type WaterTypeValue } from "@/lib/enums";
import { getUserDataByUserId } from "@/server/queries/user";

interface Props {
	userId: string;
}

export default async function UserHouseholdCard({ userId }: Props) {
	const userData = await getUserDataByUserId(userId);

	if (!userData) {
		return (
			<Card>
				<CardHeader>
					<div className="flex flex-row items-center gap-3">
						<HomeIcon className="size-5" />
						<div className="flex min-w-0 flex-col">
							<CardTitle>Haushalt</CardTitle>
							<CardDescription>Informationen zum Haushalt</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">Keine Daten vorhanden</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-row items-center gap-3">
					<HomeIcon className="size-5" />
					<div className="flex min-w-0 flex-col">
						<CardTitle>Haushalt</CardTitle>
						<CardDescription>Informationen zum Haushalt</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span className="text-muted-foreground">Immobilientyp:</span>
						<p>
							{userData.property
								? (HouseTypeDisplay[userData.property as HouseTypeValue] ?? userData.property)
								: "-"}
						</p>
					</div>
					<div>
						<span className="text-muted-foreground">Haushaltsgröße:</span>
						<p>{userData.household ? `${userData.household} Person(en)` : "-"}</p>
					</div>
					<div>
						<span className="text-muted-foreground">Wohnfläche:</span>
						<p>{userData.livingSpace ? `${userData.livingSpace} m²` : "-"}</p>
					</div>
					<div>
						<span className="text-muted-foreground">Warmwasser:</span>
						<p>
							{userData.hotWater
								? (WaterTypeDisplay[userData.hotWater as WaterTypeValue] ?? userData.hotWater)
								: "-"}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
