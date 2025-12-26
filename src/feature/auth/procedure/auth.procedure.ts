import { implement } from "@orpc/server";
import type { Context } from "../../../server/orpc/context";
import { authContract } from "../contract/auth.contact";
import { AuthRepository } from "../repo/auth.repo";
import { AuthService } from "../services/auth.service";

const authRepo = new AuthRepository();
const authService = new AuthService(authRepo);
const os = implement(authContract).$context<Context>();

export const authProcedure = os.router({
	login: os.login.handler(({ input }) => {
		return authService.login(input);
	}),
});
