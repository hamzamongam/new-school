import { onError } from "@orpc/server"
import { RPCHandler } from "@orpc/server/fetch"
import { createFileRoute } from "@tanstack/react-router"
import { logger } from "@/lib/logger"
import { router } from "@/server/orpc/router"
import { onGlobalError } from "@/server/orpc/utils"

/**
 * Standard RPC handler for TanStack Router / server function calls.
 */
const rpcHandler = new RPCHandler(router, {
  interceptors: [
    onGlobalError, // Centralized domain error mapping
    onError((error) => {
      logger.error({ error }, "RPC handler error");
    }),
  ],
})

async function handle({ request }: { request: Request }) {
  const { response } = await rpcHandler.handle(request, {
    context: {
      headers: request.headers,
    },
  })
  return response
}

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
})
