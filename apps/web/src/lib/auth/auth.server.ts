import { cache } from "react";
import "server-only";
import { getActionSession } from "./auth.action";

export const getSession = cache(async () => getActionSession());
