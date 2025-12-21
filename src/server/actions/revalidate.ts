"use server";

import { revalidatePath } from "next/cache";

export async function revalidatePaths(paths: string[]): Promise<void> {
	for (const path of paths) {
		revalidatePath(path);
	}
}
