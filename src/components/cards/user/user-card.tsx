import { MailIcon, ShieldIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserForPage } from "@/server/queries/user";

interface Props {
	user: UserForPage;
	experimentMode: boolean;
}

export default function UserCard({ user, experimentMode }: Props) {
	const displayName = user.firstname || user.lastname ? `${user.firstname} ${user.lastname}`.trim() : user.username;

	return (
		<Card className="col-span-1 overflow-hidden">
			<CardHeader>
				<div className="flex flex-row items-center justify-between gap-2">
					<div className="flex min-w-0 flex-col gap-1">
						<CardTitle className="flex items-center gap-2">
							<UserIcon className="size-4" />
							<Link href={`/admin/users/${user.id}`} className="truncate hover:underline">
								{displayName}
							</Link>
						</CardTitle>
						<CardDescription className="flex items-center gap-1 truncate">
							<MailIcon className="size-3" />
							{user.email}
						</CardDescription>
					</div>
					<div className="flex shrink-0 flex-row items-center gap-2">
						<Badge variant={user.isActive ? "default" : "secondary"}>
							{user.isActive ? "Aktiv" : "Inaktiv"}
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<div className="flex flex-row flex-wrap items-center gap-2">
					{user.isAdmin && (
						<Badge variant="outline" className="flex items-center gap-1">
							<ShieldIcon className="size-3" />
							Admin
						</Badge>
					)}
					{experimentMode && user.isParticipant && <Badge variant="secondary">Teilnehmer</Badge>}
				</div>
			</CardContent>
		</Card>
	);
}
