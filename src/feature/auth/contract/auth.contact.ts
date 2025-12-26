import { oc } from "@orpc/contract";
import z from "zod";
import { loginSchema } from "./auth.schema";

export const authContract = oc.router({
	login: oc.input(loginSchema).output(z.any()),
});
