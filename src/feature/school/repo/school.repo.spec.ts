import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/db/prisma'
import { SchoolRepository } from './school.repo'

describe('SchoolRepository', () => {
    const repo = new SchoolRepository()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('create', () => {
        it('should create a school', async () => {
            const data = { name: 'Test School', slug: 'test-school' }
            const mockSchool = { id: '1', ...data, createdAt: new Date(), updatedAt: new Date() }
            vi.mocked(prisma.school.create).mockResolvedValue(mockSchool as any)

            const result = await repo.create(data)

            expect(prisma.school.create).toHaveBeenCalledWith({ data })
            expect(result).toEqual(mockSchool)
        })

        it('should handle database errors when creating a school', async () => {
            const data = { name: 'Test School', slug: 'test-school' }
            const dbError = new Error('Database connection failed')
            vi.mocked(prisma.school.create).mockRejectedValue(dbError)

            await expect(repo.create(data)).rejects.toThrow('Database connection failed')

            expect(prisma.school.create).toHaveBeenCalledWith({ data })
        })

        it('should handle unique constraint violations', async () => {
            const data = { name: 'Test School', slug: 'existing-slug' }
            const prismaError = new Error('Unique constraint failed on slug')
            prismaError.name = 'PrismaClientKnownRequestError'
            vi.mocked(prisma.school.create).mockRejectedValue(prismaError)

            await expect(repo.create(data)).rejects.toThrow('Unique constraint failed on slug')
        })
    })

    describe('findBySlug', () => {
        it('should find a school by slug', async () => {
            const slug = 'test-school'
            const mockSchool = { id: '1', name: 'Test School', slug, createdAt: new Date(), updatedAt: new Date() }
            vi.mocked(prisma.school.findUnique).mockResolvedValue(mockSchool as any)

            const result = await repo.findBySlug(slug)

            expect(prisma.school.findUnique).toHaveBeenCalledWith({ where: { slug } })
            expect(result).toEqual(mockSchool)
        })

        it('should return null when school not found by slug', async () => {
            const slug = 'non-existent-slug'
            vi.mocked(prisma.school.findUnique).mockResolvedValue(null)

            const result = await repo.findBySlug(slug)

            expect(prisma.school.findUnique).toHaveBeenCalledWith({ where: { slug } })
            expect(result).toBeNull()
        })

        it('should handle database errors when finding by slug', async () => {
            const slug = 'test-school'
            const dbError = new Error('Database connection failed')
            vi.mocked(prisma.school.findUnique).mockRejectedValue(dbError)

            await expect(repo.findBySlug(slug)).rejects.toThrow('Database connection failed')
        })
    })

    describe('findById', () => {
        it('should find a school by id', async () => {
            const id = '1'
            const mockSchool = { id, name: 'Test School', slug: 'test-school', createdAt: new Date(), updatedAt: new Date() }
            vi.mocked(prisma.school.findUnique).mockResolvedValue(mockSchool as any)

            const result = await repo.findById(id)

            expect(prisma.school.findUnique).toHaveBeenCalledWith({ where: { id } })
            expect(result).toEqual(mockSchool)
        })

        it('should return null when school not found by id', async () => {
            const id = 'non-existent-id'
            vi.mocked(prisma.school.findUnique).mockResolvedValue(null)

            const result = await repo.findById(id)

            expect(prisma.school.findUnique).toHaveBeenCalledWith({ where: { id } })
            expect(result).toBeNull()
        })

        it('should handle database errors when finding by id', async () => {
            const id = '1'
            const dbError = new Error('Database connection failed')
            vi.mocked(prisma.school.findUnique).mockRejectedValue(dbError)

            await expect(repo.findById(id)).rejects.toThrow('Database connection failed')
        })

        it('should handle empty string id', async () => {
            const id = ''
            vi.mocked(prisma.school.findUnique).mockResolvedValue(null)

            const result = await repo.findById(id)

            expect(prisma.school.findUnique).toHaveBeenCalledWith({ where: { id } })
            expect(result).toBeNull()
        })
    })
})
