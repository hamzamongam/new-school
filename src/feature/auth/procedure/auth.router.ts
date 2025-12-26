import { implement } from "@orpc/server";
import type { Context } from "../../../server/orpc/context";
import { createRateLimitMiddleware } from "../../../server/orpc/rate-limit";
import { SchoolRepository } from "../../school/repo/school.repo";
import { SchoolService } from "../../school/services/school.service";
import { authContract } from "../contract/auth.contract";
import { AuthRepository } from "../repo/auth.repo";
import { AuthService } from "../services/auth.service";

const authRepo = new AuthRepository();
const schoolRepo = new SchoolRepository();
const schoolService = new SchoolService(schoolRepo);
const authService = new AuthService(authRepo, schoolService);
const os = implement(authContract).$context<Context>();

const loginRateLimit = createRateLimitMiddleware("login");
const registerSchoolRateLimit = createRateLimitMiddleware("registerSchool");

export const authRouter = os.router({
	login: os.login.use(loginRateLimit).handler(({ input }) => {
		return authService.login(input);
	}),
	registerSchool: os.registerSchool.use(registerSchoolRateLimit).handler(({ input }) => {
		return authService.registerSchool(input);
	}),
	me: os.me.handler(({ context }) => {
		return authService.me(context.headers);
	}),
});
