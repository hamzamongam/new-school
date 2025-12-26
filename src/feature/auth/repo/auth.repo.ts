import { prisma } from "@/db/prisma";

/**
 * AuthRepository manages database interactions related to authentication
 * and user-tenant relationship management.
 */
export class AuthRepository {
  /**
   * Links an existing user to a specific school with a designated role.
   * Internal method used during onboarding or school joining.
   * @param userId - ID of the user.
   * @param schoolId - ID of the school (tenant).
   * @param role - Access role (e.g., 'school_admin', 'teacher').
   */
  async linkUserToSchool(userId: string, schoolId: string, role: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        schoolId,
        role,
      },
    });
  }
}