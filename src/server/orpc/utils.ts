import { ORPCError } from "@orpc/server"
import { ZodError } from "zod";
import { logger } from "@/lib/logger";
import { AppError } from "@/utils/errors";

/**
 * onGlobalError is a global error mapping interceptor.
 * It catches domain-level AppErrors and maps them to ORPCErrors.
 * 
 * We use an explicit interceptor pattern here to ensure compatibility
 * with both OpenAPIHandler and RPCHandler types.
 */
export const onGlobalError = async ({ next }: { next: () => Promise<any> }) => {
    try {
        return await next()
    } catch (error) {
        if (error instanceof AppError) {
            logger.warn({ 
                error: error.code, 
                message: error.message, 
                details: error.details 
            }, "Application error occurred");
            throw new ORPCError(error.code as any, { 
                message: error.message,
                data: error.details
            });
        }

        if (error instanceof ZodError) {
            logger.warn({ 
                errors: error.flatten().fieldErrors 
            }, "Validation error occurred");
            throw new ORPCError("BAD_REQUEST", {
                message: "Validation failed",
                data: error.flatten().fieldErrors
            });
        }

        // Log unexpected errors
        logger.error({ error }, "Unexpected error occurred");
        throw error
    }
}