import { ORPCError, os } from "@orpc/server";
import { auth } from "../auth";
// import type { Context } from "./context";

export const baseContext = os.$context<{
  headers: Headers;
}>();

export const requiredAuthMiddleware = baseContext.middleware(async ({ next, context }) => {
		// 1. BetterAuth സെഷൻ ചെക്ക് ചെയ്യുന്നു
		const session = await auth.api.getSession({
			headers: context.headers,
		});

		if (!session) {
			throw new ORPCError("UNAUTHORIZED", { message: "Login required" });
		}

		// 2. സെഷനിലുള്ള വിവരങ്ങൾ എല്ലാ സർവീസുകൾക്കും ലഭ്യമാക്കുന്നു
		return next({
			context: {
				...context,
				user: session.user,
				schoolId: session.user.schoolId,
			},
		});
	});
