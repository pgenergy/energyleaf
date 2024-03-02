import type { lucia } from "@/lib/auth/auth";

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseUserAttributes {
    id: string;
    name: string;
    email: string;
    created: string | null;
    isAdmin: boolean;
    isActive: boolean;
}
