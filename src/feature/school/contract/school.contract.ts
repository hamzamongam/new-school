import { oc } from "@orpc/contract";
import z from "zod";

export const SchoolSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
});

export const schoolContract = oc.router({
  create: oc.input(SchoolSchema).output(z.any()),
  get: oc.input(z.object({ id: z.string() })).output(z.any()),
});
