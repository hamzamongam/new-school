import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('schoolRouter', () => {
    beforeEach(() => {
        vi.resetModules()
        vi.clearAllMocks()
    })

    it('should call schoolService.create in the create handler', async () => {
        const mockCreate = vi.fn()
        vi.doMock('../services/school.service', () => ({
            SchoolService: vi.fn().mockImplementation(() => ({
                create: mockCreate
            }))
        }))

        const { schoolRouter } = await import('./school.router')

        const input = { name: 'Test School', slug: 'test-school' }
        const mockSchool = { id: '1', ...input }
        mockCreate.mockResolvedValue(mockSchool as any)

        // @ts-ignore
        const result = await schoolRouter.create['~orpc'].handler({ input, context: {} })

        expect(mockCreate).toHaveBeenCalledWith(input)
        expect(result).toEqual(mockSchool)
    })

    it('should call schoolService.getById in the get handler', async () => {
        const mockGetById = vi.fn()
        vi.doMock('../services/school.service', () => ({
            SchoolService: vi.fn().mockImplementation(() => ({
                getById: mockGetById
            }))
        }))

        const { schoolRouter } = await import('./school.router')

        const id = '1'
        const mockSchool = { id, name: 'Test School', slug: 'test-school' }
        mockGetById.mockResolvedValue(mockSchool as any)

        // @ts-ignore
        const result = await schoolRouter.get['~orpc'].handler({ input: { id }, context: {} })

        expect(mockGetById).toHaveBeenCalledWith(id)
        expect(result).toEqual(mockSchool)
    })
})
