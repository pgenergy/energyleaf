import { cookies } from "next/headers";
import "server-only";
import { validateSessionToken } from "@energyleaf/postgres/query/auth";
import { redirect } from "next/navigation";

export const getActionSession = async () => {
    const token = cookies().get("auth_session")?.value ?? null;
    if (!token) {
        return {
            user: null,
            session: null,
        };
    }

    try {
        const result = await validateSessionToken(token);
        if (result.user && result.session) {
            return result;
        }
    } catch {
        // ignore
    }
    cookies().delete("auth_session");
    redirect("/");
};

export const checkIfAdmin = async () => {
    const { user, session } = await getActionSession();
    if (!session) {
        return false;
    }
    if (!user.isAdmin) {
        return false;
    }

    return true;
};
