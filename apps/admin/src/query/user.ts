import { cache } from "react";

import "server-only";

import { getAllUsers as getAllUsersDb, getUserById as getUserByIdDb } from "@energyleaf/db/query";

export const getAllUsers = cache(async () => {
    return getAllUsersDb();
});

export const getUserById = cache(async (id: string) => {
    return getUserByIdDb(id);
});
