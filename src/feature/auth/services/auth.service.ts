import { AuthRepository } from "../repo/auth.repo";
import { TLoginSchema } from "../contract/auth.schema";
import { auth } from "@/server/auth";

// src/modules/auth/services/auth.service.TLoginSchema
export class AuthService {
    constructor(private repo: AuthRepository) {}
    async login(input: TLoginSchema) {
        return await auth.api.signInEmail({
            body: {
                email: input.email,
                password: input.password,
            }
        });
    }
}