import {cache} from "react";
import {
    getAllUsers as getAllUsersDb,
    getUserById
} from "@energyleaf/db/query";

export const getAllUsers = cache(async () => {
    return getAllUsersDb();
});

export const getUser = cache(async (id: number) => {
    return getUserById(id);
});