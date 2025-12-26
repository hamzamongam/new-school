import { createServerOnlyFn } from "@tanstack/react-start";
import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/plugins";
import { parseSetCookieHeader } from "./utils";

export const tanstackStartCookie = () =>
	createServerOnlyFn(() => ({
		id: "tanstack-start-cookie",
		hooks: {
			after: [
				{
					matcher() {
						return true;
					},
					handler: createAuthMiddleware(async (ctx) => {
						const returned = ctx.context.responseHeaders;

						if ("_flag" in ctx && ctx._flag === "router") {
							return;
						}

						if (returned instanceof Headers) {
							let setCookies: string | string[] | null | undefined;

							if (typeof returned.getSetCookie === "function") {
								setCookies = returned.getSetCookie();
							} else {
								setCookies = returned.get("set-cookie");
							}

							if (
								!setCookies ||
								(Array.isArray(setCookies) && setCookies.length === 0)
							) {
								return;
							}

							const parsed = parseSetCookieHeader(setCookies);
							const { setCookie } = await import(
								"@tanstack/react-start/server"
							);

							parsed.forEach((value, key) => {
								if (!key) {
									return;
								}
								const opts = {
									sameSite: value.samesite,
									secure: value.secure,
									maxAge: value["max-age"],
									httpOnly: value.httponly,
									domain: value.domain,
									path: value.path,
								} as const;
								try {
									setCookie(key, decodeURIComponent(value.value), opts);
									// eslint-disable-next-line @typescript-eslint/no-unused-vars
								} catch (_) {
									/* empty */
								}
							});
							return;
						}
					}),
				},
			],
		},
	}))() satisfies BetterAuthPlugin;
