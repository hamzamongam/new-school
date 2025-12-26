import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConflictError, NotFoundError } from '@/utils/errors'
import { SchoolService } from './school.service'

describe('SchoolService', () => {
    let service: SchoolService
    let repo: any

    beforeEach(() => {
        repo = {
            findBySlug: vi.fn(),
            create: vi.fn(),
            findById: vi.fn(),
        }
        service = new SchoolService(repo as any)
        vi.clearAllMocks()
    })

    describe('create', () => {
        it('should create a school successfully', async () => {
            const data = { name: 'New School', slug: 'new-school' }
            const mockSchool = { id: '1', ...data }
            
            repo.findBySlug.mockResolvedValue(null)
            repo.create.mockResolvedValue(mockSchool as any)

            const result = await service.create(data)

            expect(repo.findBySlug).toHaveBeenCalledWith(data.slug)
            expect(repo.create).toHaveBeenCalledWith(data)
            expect(result).toEqual(mockSchool)
        })

        it('should throw ConflictError if slug already exists', async () => {
            const data = { name: 'Existing School', slug: 'existing-school' }
            repo.findBySlug.mockResolvedValue({ id: '1', ...data } as any)

            await expect(service.create(data)).rejects.toThrow(ConflictError)
            expect(repo.create).not.toHaveBeenCalled()
        })

        it('should propagate database errors from findBySlug', async () => {
            const data = { name: 'New School', slug: 'new-school' }
            const dbError = new Error('Database connection failed')
            repo.findBySlug.mockRejectedValue(dbError)

            await expect(service.create(data)).rejects.toThrow('Database connection failed')
            expect(repo.create).not.toHaveBeenCalled()
        })

        it('should propagate database errors from create', async () => {
            const data = { name: 'New School', slug: 'new-school' }
            repo.findBySlug.mockResolvedValue(null)
            const dbError = new Error('Failed to create school')
            repo.create.mockRejectedValue(dbError)

            await expect(service.create(data)).rejects.toThrow('Failed to create school')
        })

        it('should handle conflict with existing school that has different name', async () => {
            const data = { name: 'New School Name', slug: 'existing-slug' }
            const existingSchool = { id: '1', name: 'Different Name', slug: 'existing-slug' }
            repo.findBySlug.mockResolvedValue(existingSchool as any)

            await expect(service.create(data)).rejects.toThrow(ConflictError)
            expect(repo.create).not.toHaveBeenCalled()
        })
    })

    describe('getById', () => {
        it('should return a school if found', async () => {
            const id = '1'
            const mockSchool = { id, name: 'Test School', slug: 'test-school' }
            repo.findById.mockResolvedValue(mockSchool as any)

            const result = await service.getById(id)

            expect(repo.findById).toHaveBeenCalledWith(id)
            expect(result).toEqual(mockSchool)
        })

        it('should throw NotFoundError if school not found', async () => {
            const id = 'non-existent'
            repo.findById.mockResolvedValue(null)

            await expect(service.getById(id)).rejects.toThrow(NotFoundError)
            await expect(service.getById(id)).rejects.toThrow('not found')
        })

        it('should propagate database errors from findById', async () => {
            const id = '1'
            const dbError = new Error('Database connection failed')
            repo.findById.mockRejectedValue(dbError)

            await expect(service.getById(id)).rejects.toThrow('Database connection failed')
        })

        it('should handle empty string id', async () => {
            const id = ''
            repo.findById.mockResolvedValue(null)

            await expect(service.getById(id)).rejects.toThrow(NotFoundError)
        })

        it('should handle invalid id format', async () => {
            const id = 'invalid-id-format-123'
            repo.findById.mockResolvedValue(null)

            await expect(service.getById(id)).rejects.toThrow(NotFoundError)
        })
    })
})
