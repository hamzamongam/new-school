import { logger } from "@/lib/logger";
import { ConflictError, NotFoundError } from "@/utils/errors";
import { SchoolRepository } from "../repo/school.repo";

/**
 * SchoolService manages school-specific business logic, including creation,
 * validation, and retrieval of school entities.
 */
export class SchoolService {
  constructor(private repo: SchoolRepository) {}

  /**
   * Creates a new school/tenant.
   * @param data - The school name and unique URL slug.
   * @throws {ConflictError} if the slug is already taken.
   * @returns The created School object.
   */
  async create(data: { name: string; slug: string }) {
    logger.debug({ slug: data.slug }, "Creating school");
    const existing = await this.repo.findBySlug(data.slug);
    if (existing) {
      logger.warn({ slug: data.slug }, "School creation failed: slug already exists");
      throw new ConflictError(`School with slug "${data.slug}" already exists`);
    }
    const school = await this.repo.create(data);
    logger.info({ schoolId: school.id, slug: data.slug }, "School created successfully");
    return school;
  }

  /**
   * Retrieves a school by its ID.
   * @param id - The unique ID of the school.
   * @throws {NotFoundError} if no school exists with that ID.
   * @returns The School object.
   */
  async getById(id: string) {
    logger.debug({ schoolId: id }, "Fetching school by ID");
    const school = await this.repo.findById(id);
    if (!school) {
      logger.warn({ schoolId: id }, "School not found");
      throw new NotFoundError(`School with ID "${id}" not found`);
    }
    return school;
  }
}
