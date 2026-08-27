import { clsx, type ClassValue } from "clsx";
import { customAlphabet } from "nanoid";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}


export function niceCeiling(value: number): number {
	if (value <= 0) return value;
	const scale = 10 ** (Math.floor(Math.log10(value * 1.1)) - 1);
	const ceiling = Math.ceil((value * 1.1) / scale) * scale;
	return Math.round(ceiling * 1000) / 1000;
}


export const genID = customAlphabet("123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 25);

type Success<T> = {
	data: T;
	error: null;
};

type Failure<E> = {
	data: null;
	error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;
export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
	try {
		const data = await promise;
		return { data, error: null };
	} catch (error) {
		return { data: null, error: error as E };
	}
}
