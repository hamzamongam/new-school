import { os } from "@orpc/server";
import type { Context } from "./context";
import { requiredAuthMiddleware } from "./middleware";

export const publicProcedure = os.$context<Context>();

export const authedProcedure = os
	.$context<Context>()
	.use(requiredAuthMiddleware);
