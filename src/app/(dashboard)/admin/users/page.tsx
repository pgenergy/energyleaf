import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { UsersOverview } from "@/components/cards/user/users-overview";
import { UserSearch } from "@/components/forms/user/user-search";
import { Skeleton } from "@/components/ui/skeleton";
import { env } from "@/env";
import { getCurrentSession } from "@/server/lib/auth";

const PAGE_SIZE = 20;

type SearchParams = Promise<{ page?: string; q?: string }>;

interface Props {
	searchParams: SearchParams;
}

export const metadata: Metadata = {
	title: "Nutzer - Admin - Energyleaf",
};

export default async function AdminUsersPage(props: Props) {
	const { user } = await getCurrentSession();
	if (!user) {
		redirect("/login");
	}

	if (!user.isAdmin) {
		redirect("/dashboard");
	}

	const searchParams = await props.searchParams;
	const pageNum = Number(searchParams.page) || 1;
	const currentPage = pageNum > 0 ? pageNum : 1;
	const query = searchParams.q?.trim() ?? "";
	const experimentMode = !env.DISABLE_EXPERIMENT;

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div className="col-span-1 flex flex-col items-center justify-between gap-2 md:col-span-2 md:flex-row">
				<h1 className="text-xl font-bold">Nutzer</h1>
				<div className="flex flex-col items-center gap-2 sm:flex-row">
					<UserSearch />
				</div>
			</div>
			<Suspense fallback={<Skeleton className="col-span-1 h-56 md:col-span-2" />}>
				<UsersOverview page={currentPage} pageSize={PAGE_SIZE} query={query} experimentMode={experimentMode} />
			</Suspense>
		</div>
	);
}
