import { authRouter } from "@/feature/auth/procedure/auth.router";
import { schoolRouter } from "@/feature/school/procedure/school.router";

export const router = {
    auth: authRouter,
    school: schoolRouter,
};