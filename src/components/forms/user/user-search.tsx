"use client";

import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 300;

export function UserSearch() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [value, setValue] = useState(searchParams.get("q") ?? "");
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const updateSearch = useCallback(
		(newValue: string) => {
			const params = new URLSearchParams(searchParams.toString());
			const trimmed = newValue.trim();

			if (trimmed) {
				params.set("q", trimmed);
			} else {
				params.delete("q");
			}
			params.set("page", "1");

			router.push(`${pathname}?${params.toString()}`);
		},
		[pathname, router, searchParams],
	);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setValue(newValue);

		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		debounceRef.current = setTimeout(() => {
			updateSearch(newValue);
		}, DEBOUNCE_MS);
	};

	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: fine here
	useEffect(() => {
		const urlQuery = searchParams.get("q") ?? "";
		if (urlQuery !== value) {
			setValue(urlQuery);
		}
	}, [searchParams]);

	return (
		<div className="relative">
			<SearchIcon className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2" />
			<Input
				type="search"
				placeholder="Nutzer suchen..."
				value={value}
				onChange={handleChange}
				className="w-full min-w-[200px] pl-8 sm:w-[250px]"
			/>
		</div>
	);
}
