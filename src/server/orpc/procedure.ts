import { os } from "@orpc/server";
import type { Context } from "./context";
import { requiredAuthMiddleware } from "./middleware";

/**
 * publicProcedure is the base ORPC procedure available for any request.
 * It provides the initial Context (including headers).
 * Note: Global error handling is now managed by interceptors in the handlers.
 */
export const publicProcedure = os.$context<Context>();

/**
 * authedProcedure is an ORPC procedure that requires a valid authenticated session.
 * It uses requiredAuthMiddleware to ensure protection and context enrichment.
 */
export const authedProcedure = publicProcedure.use(requiredAuthMiddleware);
