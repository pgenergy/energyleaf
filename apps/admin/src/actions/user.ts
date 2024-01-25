import { getAllUsers as getAllUsersDb } from "@energyleaf/db/query";
import { cache } from "react";
import {getSession} from "@/lib/auth/auth";
import {UserNotLoggedInError} from "@energyleaf/lib";

export const getAllUsers = cache(async () => {
    const session = await getSession();
    if (!session) {
        throw new UserNotLoggedInError();
    }

    if (!session.user.admin) {
        throw new Error("User is not an admin");
    }

    return await getAllUsersDb();
});