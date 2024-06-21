import {
    getAllUsers as getAllUsersDb,
    getUserExperimentData as getDbUserExperimentData,
    getUserById as getUserByIdDb,
    getUserDataByUserId,
} from "@energyleaf/db/query";
import { cache } from "react";
import "server-only";

export const getAllUsers = cache(async () => {
    return getAllUsersDb();
});

export const getUserById = cache(async (id: string) => {
    return getUserByIdDb(id);
});

export const getUserDataById = cache(async (id: string) => {
    return getUserDataByUserId(id);
});

export const getUserExperimentData = cache(async (id: string) => {
    return getDbUserExperimentData(id);
});
