import { cache } from "react";
import "server-only";
import { getMiddlewareSession } from "./auth.middleware";

export const getSession = cache(async () => getMiddlewareSession());
