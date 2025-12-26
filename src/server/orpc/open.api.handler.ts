import { OpenAPIHandler } from "@orpc/openapi/fetch"
import { router } from "./router"
import { SmartCoercionPlugin } from "@orpc/json-schema"
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4"
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins"
import { onGlobalError } from "./utils"

/**
 * Centralized OpenAPI handler for REST-like access to ORPC procedures.
 * Includes global interceptors for error mapping and logging.
 */
export const openApiHandler = new OpenAPIHandler(router, {
  interceptors: [
    onGlobalError, // Centralized domain error mapping
  ],
  plugins: [
    new SmartCoercionPlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: 'TanStack ORPC Playground',
          version: '1.0.0',
        },
        commonSchemas: {
          UndefinedError: { error: 'UndefinedError' },
        },
        security: [{ bearerAuth: [] }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
            },
          },
        },
      },
      docsConfig: {
        authentication: {
          securitySchemes: {
            bearerAuth: {
              token: 'better-auth-token',
            },
          },
        },
      },
    }),
  ],
})
