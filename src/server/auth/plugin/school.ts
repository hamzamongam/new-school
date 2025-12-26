import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, getSessionFromCtx } from "better-auth/api";
import { schoolSchema } from "@/server/orpc/schema/school";

export const schoolPlugin = () => {
	return {
		id: "school",
		$Infer: { getHelloWorld: "" },
		init: () => {},
		endpoints: {
			createSchool: createAuthEndpoint(
				"/school/create",
				{
					method: "POST",
					body: schoolSchema,
				},
				async (ctx) => {
					// ctx.context
					const _session = await getSessionFromCtx(ctx);
					return ctx.json({
						message: "Hello World",
					});
				},
			),
		},
	} satisfies BetterAuthPlugin;
};
