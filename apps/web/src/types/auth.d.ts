import type { lucia } from "@/lib/auth/auth.config";

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseUserAttributes {
    id: string;
    username: string;
    firstname: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string;
    created: string | null;
    isAdmin: boolean;
    isActive: boolean;
    appVersion: number;
    onboardingCompleted: boolean;
}
