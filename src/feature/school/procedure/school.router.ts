import { implement } from "@orpc/server";
import type { Context } from "../../../server/orpc/context";
import { schoolContract } from "../contract/school.contract";
import { SchoolRepository } from "../repo/school.repo";
import { SchoolService } from "../services/school.service";
import { requiredAuthMiddleware } from "../../../server/orpc/middleware";

const schoolRepo = new SchoolRepository();
const schoolService = new SchoolService(schoolRepo);

const os = implement(schoolContract).$context<Context>();

export const schoolRouter = os.router({
  create: os.create.use(requiredAuthMiddleware).handler(async ({ input, }) => {
    return await schoolService.create(input);
  }),
  get: os.get.use(requiredAuthMiddleware).handler(async ({ input }) => {
    return await schoolService.getById(input.id);
  }),
});
