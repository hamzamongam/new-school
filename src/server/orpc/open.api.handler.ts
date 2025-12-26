import { OpenAPIHandler } from "@orpc/openapi/fetch"
import { router } from "./router"
import { onError } from "@orpc/server"
import { SmartCoercionPlugin } from "@orpc/json-schema"
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4"
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins"




export const openApiHandler = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error)
    }),
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
        //   Todo: { schema: TodoSchema },
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
