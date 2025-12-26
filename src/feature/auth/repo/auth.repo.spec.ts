import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/db/prisma'
import { AuthRepository } from './auth.repo'

describe('AuthRepository', () => {
    const repo = new AuthRepository()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('linkUserToSchool', () => {
        it('should link user to school', async () => {
            const userId = 'user-1'
            const schoolId = 'school-1'
            const role = 'school_admin'
            
            const mockUser = { id: userId, schoolId, role, email: 'test@example.com' }
            vi.mocked(prisma.user.update).mockResolvedValue(mockUser as any)

            const result = await repo.linkUserToSchool(userId, schoolId, role)

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { schoolId, role },
            })
            expect(result).toEqual(mockUser)
        })

        it('should handle database errors when linking user to school', async () => {
            const userId = 'user-1'
            const schoolId = 'school-1'
            const role = 'school_admin'
            
            const dbError = new Error('Database connection failed')
            vi.mocked(prisma.user.update).mockRejectedValue(dbError)

            await expect(repo.linkUserToSchool(userId, schoolId, role)).rejects.toThrow('Database connection failed')

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { schoolId, role },
            })
        })

        it('should handle Prisma not found errors', async () => {
            const userId = 'non-existent-user'
            const schoolId = 'school-1'
            const role = 'school_admin'
            
            const prismaError = new Error('Record not found')
            prismaError.name = 'NotFoundError'
            vi.mocked(prisma.user.update).mockRejectedValue(prismaError)

            await expect(repo.linkUserToSchool(userId, schoolId, role)).rejects.toThrow('Record not found')
        })
    })
})
