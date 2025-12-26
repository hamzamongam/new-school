import { logger } from "@/lib/logger";
import { auth } from "@/server/auth";
import { BadRequestError, UnauthorizedError } from "@/utils/errors";
import { SchoolService } from "../../school/services/school.service";
import { RegisterSchoolInput, TLoginSchema } from "../contract/auth.schema";
import { AuthRepository } from "../repo/auth.repo";

/**
 * AuthService handles the core authentication logic for the SaaS platform.
 * It integrates Better-Auth for identity management and handles specialized
 * flows like school registration/onboarding.
 */
export class AuthService {
    constructor(
        private repo: AuthRepository,
        private schoolService: SchoolService
    ) {}

    /**
     * Authenticates a user using email and password.
     * @param input - The login credentials (email and password).
     * @returns The session object from Better-Auth.
     * @throws {UnauthorizedError} if login fails.
     */
    async login(input: TLoginSchema) {
        try {
            logger.info({ email: input.email }, "Login attempt");
            const result = await auth.api.signInEmail({
                body: {
                    email: input.email,
                    password: input.password,
                }
            });
            logger.info({ email: input.email, userId: result?.user?.id }, "Login successful");
            return result;
        } catch (error) {
            logger.warn({ email: input.email, error: error instanceof Error ? error.message : "Unknown error" }, "Login failed");
            throw new UnauthorizedError(error instanceof Error ? error.message : "Invalid credentials");
        }
    }

    /**
     * Executes the full onboarding flow for a new school.
     * 1. Creates a new school profile.
     * 2. Registers the admin user via Better-Auth.
     * 3. Explicitly links the user to the school as 'school_admin'.
     * @param input - School details and admin user credentials.
     * @returns Success status, the created school, and user details.
     * @throws {BadRequestError} if user creation fails.
     */
    async registerSchool(input: RegisterSchoolInput) {
        logger.info({ schoolName: input.schoolName, slug: input.slug, email: input.email }, "School registration attempt");
        
        // 1. Check/Create school via SchoolService
        const school = await this.schoolService.create({
            name: input.schoolName,
            slug: input.slug,
        });

        logger.debug({ schoolId: school.id }, "School created");

        // 2. Create the user using better-auth
        const userResp = await auth.api.signUpEmail({
            body: {
                email: input.email,
                password: input.password,
                name: input.adminName,
                schoolId: school.id,
                role: "schoolAdmin",
            }
        });

        if (!userResp || !userResp.user) {
            logger.error({ schoolId: school.id, email: input.email }, "User creation failed during school registration");
            throw new BadRequestError("User creation failed");
        }

        logger.debug({ userId: userResp.user.id, schoolId: school.id }, "User created, linking to school");

        // 3. Link user to school as admin (Double check linking)
        await this.repo.linkUserToSchool(userResp.user.id, school.id, "schoolAdmin");

        logger.info({ schoolId: school.id, userId: userResp.user.id }, "School registration completed successfully");

        return {
            success: true,
            school,
            user: userResp.user,
        };
    }

    /**
     * Retrieves the current authenticated session.
     * @param headers - Request headers containing session cookies/tokens.
     * @returns The current session object.
     * @throws {UnauthorizedError} if no session is active.
     */
    async me(headers: Headers) {
        const session = await auth.api.getSession({
            headers,
        });
        
        if (!session) {
            logger.warn("Session check failed: no active session");
            throw new UnauthorizedError("No active session");
        }
        
        logger.debug({ userId: session.user.id }, "Session validated");
        return session;
    }
}