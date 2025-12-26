import { oc } from "@orpc/contract";
import z from "zod";
import { loginSchema, RegisterSchoolSchema } from "./auth.schema";

export const authContract = oc.router({
	login: oc.input(loginSchema).output(z.any()),
	registerSchool: oc.input(RegisterSchoolSchema).output(z.any()),
	me: oc.output(z.any()),
});
