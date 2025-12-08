import {
	CpuIcon,
	DropletIcon,
	EyeIcon,
	FlameIcon,
	MoreVerticalIcon,
	PencilIcon,
	UserIcon,
	UserPlusIcon,
	ZapIcon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SensorTypeDisplay, type SensorTypeValue } from "@/lib/enums";
import type { SensorWithUser } from "@/server/queries/sensor";

interface Props {
	sensor: SensorWithUser;
}

function SensorTypeIcon({ type }: { type: string }) {
	switch (type) {
		case "electricity":
			return <ZapIcon className="size-4" />;
		case "water":
			return <DropletIcon className="size-4" />;
		case "gas":
			return <FlameIcon className="size-4" />;
		default:
			return <CpuIcon className="size-4" />;
	}
}

export default function SensorCard({ sensor }: Props) {
	return (
		<Card className="col-span-1 overflow-hidden">
			<CardHeader>
				<div className="flex flex-row items-center justify-between gap-2">
					<div className="flex min-w-0 flex-col gap-1">
						<CardTitle className="flex items-center gap-2">
							<SensorTypeIcon type={sensor.sensorType} />
							<Link
								href={`/admin/sensors/${encodeURIComponent(sensor.clientId)}`}
								className="truncate hover:underline"
							>
								{sensor.clientId}
							</Link>
						</CardTitle>
						<CardDescription className="truncate">{sensor.id}</CardDescription>
					</div>
					<div className="flex shrink-0 flex-row items-center gap-2">
						<Badge variant={sensor.user ? "default" : "secondary"}>
							{SensorTypeDisplay[sensor.sensorType as SensorTypeValue]}
						</Badge>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="cursor-pointer">
									<MoreVerticalIcon className="size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem asChild>
									<Link
										href={`/admin/sensors/${encodeURIComponent(sensor.clientId)}`}
										className="cursor-pointer"
									>
										<EyeIcon className="mr-2 size-4" />
										Anzeigen
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link
										href={`/admin/sensors/${encodeURIComponent(sensor.clientId)}/edit`}
										className="cursor-pointer"
									>
										<PencilIcon className="mr-2 size-4" />
										Bearbeiten
									</Link>
								</DropdownMenuItem>
								{!sensor.user && (
									<DropdownMenuItem asChild>
										<Link
											href={`/admin/sensors/${encodeURIComponent(sensor.clientId)}/assign`}
											className="cursor-pointer"
										>
											<UserPlusIcon className="mr-2 size-4" />
											Nutzer zuweisen
										</Link>
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<div className="flex min-w-0 flex-row items-center gap-2">
					<UserIcon className="text-muted-foreground shrink-0 size-4" />
					{sensor.user ? (
						<span className="truncate text-sm">
							{sensor.user.username} ({sensor.user.email})
						</span>
					) : (
						<span className="text-muted-foreground text-sm">Nicht zugewiesen</span>
					)}
				</div>
				<div className="flex flex-row flex-wrap items-center gap-2">
					<Badge variant="outline">Version {sensor.version}</Badge>
					{sensor.needsScript && <Badge variant="secondary">Script erforderlich</Badge>}
				</div>
			</CardContent>
		</Card>
	);
}
