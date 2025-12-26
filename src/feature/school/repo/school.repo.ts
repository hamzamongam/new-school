import { prisma } from "@/db/prisma";

/**
 * SchoolRepository manages direct database operations for School entities.
 */
export class SchoolRepository {
  /**
   * Creates a new school entry.
   * @param data - School name and slug.
   */
  async create(data: { name: string; slug: string }) {
    return await prisma.school.create({
      data,
    });
  }

  /**
   * Finds a school by its unique URL slug.
   * @param slug - The URL-friendly identifier.
   */
  async findBySlug(slug: string) {
    return await prisma.school.findUnique({
      where: { slug },
    });
  }

  /**
   * Finds a school by its primary unique ID.
   * @param id - The CUID or UUID of the school.
   */
  async findById(id: string) {
    return await prisma.school.findUnique({
      where: { id },
    });
  }
}
