import { describe, it, expect, vi, beforeEach } from 'vitest'
import { auth } from '@/server/auth'
import { BadRequestError, UnauthorizedError } from '@/utils/errors'
import { SchoolService } from '../../school/services/school.service'
import { AuthRepository } from '../repo/auth.repo'
import { AuthService } from './auth.service'

describe('AuthService', () => {
    let service: AuthService
    let repo: AuthRepository
    let schoolService: SchoolService

    beforeEach(() => {
        repo = new AuthRepository()
        schoolService = new SchoolService({} as any) // Mocked below
        service = new AuthService(repo, schoolService)
        vi.clearAllMocks()
    })

    describe('login', () => {
        it('should login successfully', async () => {
            const input = { email: 'test@example.com', password: 'password123' }
            const mockSession = { user: { id: '1', email: input.email }, session: { id: 's1' } }
            
            vi.mocked(auth.api.signInEmail).mockResolvedValue(mockSession as any)

            const result = await service.login(input)

            expect(auth.api.signInEmail).toHaveBeenCalledWith({
                body: {
                    email: input.email,
                    password: input.password,
                }
            })
            expect(result).toEqual(mockSession)
        })

        it('should throw UnauthorizedError on login failure', async () => {
            const input = { email: 'wrong@example.com', password: 'wrong' }
            vi.mocked(auth.api.signInEmail).mockRejectedValue(new Error('Invalid credentials'))

            await expect(service.login(input)).rejects.toThrow(UnauthorizedError)
        })

        it('should handle network errors during login', async () => {
            const input = { email: 'test@example.com', password: 'password123' }
            const networkError = new Error('Network error')
            networkError.name = 'NetworkError'
            vi.mocked(auth.api.signInEmail).mockRejectedValue(networkError)

            await expect(service.login(input)).rejects.toThrow(UnauthorizedError)
            await expect(service.login(input)).rejects.toThrow('Network error')
        })

        it('should handle non-Error rejection values', async () => {
            const input = { email: 'test@example.com', password: 'password123' }
            vi.mocked(auth.api.signInEmail).mockRejectedValue('String error')

            await expect(service.login(input)).rejects.toThrow(UnauthorizedError)
        })
    })

    describe('registerSchool', () => {
        it('should register a school and admin user successfully', async () => {
            const input = {
                schoolName: 'Test Academy',
                slug: 'test-academy',
                adminName: 'Admin User',
                email: 'admin@test.com',
                password: 'password123',
            }
            const mockSchool = { id: 'school-1', name: input.schoolName, slug: input.slug }
            const mockUser = { id: 'user-1', name: input.adminName, email: input.email }
            
            vi.spyOn(schoolService, 'create').mockResolvedValue(mockSchool as any)
            vi.mocked(auth.api.signUpEmail).mockResolvedValue({ user: mockUser } as any)
            vi.spyOn(repo, 'linkUserToSchool').mockResolvedValue({} as any)

            const result = await service.registerSchool(input)

            expect(schoolService.create).toHaveBeenCalledWith({
                name: input.schoolName,
                slug: input.slug,
            })
            expect(auth.api.signUpEmail).toHaveBeenCalledWith({
                body: {
                    email: input.email,
                    password: input.password,
                    name: input.adminName,
                    schoolId: mockSchool.id,
                    role: 'schoolAdmin',
                }
            })
            expect(repo.linkUserToSchool).toHaveBeenCalledWith(mockUser.id, mockSchool.id, 'schoolAdmin')
            expect(result).toEqual({
                success: true,
                school: mockSchool,
                user: mockUser,
            })
        })

        it('should throw BadRequestError if user creation fails', async () => {
            const input = {
                schoolName: 'Failed Academy',
                slug: 'failed-academy',
                adminName: 'Admin User',
                email: 'admin@failed.com',
                password: 'password123',
            }
            const mockSchool = { id: 'school-1', name: input.schoolName, slug: input.slug }
            
            vi.spyOn(schoolService, 'create').mockResolvedValue(mockSchool as any)
            vi.mocked(auth.api.signUpEmail).mockResolvedValue(null as any)

            await expect(service.registerSchool(input)).rejects.toThrow(BadRequestError)
        })

        it('should throw BadRequestError if user response has no user property', async () => {
            const input = {
                schoolName: 'Failed Academy',
                slug: 'failed-academy',
                adminName: 'Admin User',
                email: 'admin@failed.com',
                password: 'password123',
            }
            const mockSchool = { id: 'school-1', name: input.schoolName, slug: input.slug }
            
            vi.spyOn(schoolService, 'create').mockResolvedValue(mockSchool as any)
            vi.mocked(auth.api.signUpEmail).mockResolvedValue({} as any)

            await expect(service.registerSchool(input)).rejects.toThrow(BadRequestError)
        })

        it('should propagate errors when school creation fails', async () => {
            const input = {
                schoolName: 'Failed Academy',
                slug: 'failed-academy',
                adminName: 'Admin User',
                email: 'admin@failed.com',
                password: 'password123',
            }
            
            const schoolError = new Error('School creation failed')
            vi.spyOn(schoolService, 'create').mockRejectedValue(schoolError)

            await expect(service.registerSchool(input)).rejects.toThrow('School creation failed')
            expect(auth.api.signUpEmail).not.toHaveBeenCalled()
        })

        it('should propagate errors when user linking fails', async () => {
            const input = {
                schoolName: 'Test Academy',
                slug: 'test-academy',
                adminName: 'Admin User',
                email: 'admin@test.com',
                password: 'password123',
            }
            const mockSchool = { id: 'school-1', name: input.schoolName, slug: input.slug }
            const mockUser = { id: 'user-1', name: input.adminName, email: input.email }
            
            vi.spyOn(schoolService, 'create').mockResolvedValue(mockSchool as any)
            vi.mocked(auth.api.signUpEmail).mockResolvedValue({ user: mockUser } as any)
            const linkError = new Error('Database error during user linking')
            vi.spyOn(repo, 'linkUserToSchool').mockRejectedValue(linkError)

            await expect(service.registerSchool(input)).rejects.toThrow('Database error during user linking')
        })
    })

    describe('me', () => {
        it('should return session if authenticated', async () => {
            const headers = new Headers()
            const mockSession = { user: { id: '1', email: 'test@example.com' }, session: { id: 's1' } }
            vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any)

            const result = await service.me(headers)

            expect(auth.api.getSession).toHaveBeenCalledWith({ headers })
            expect(result).toEqual(mockSession)
        })

        it('should throw UnauthorizedError if not authenticated', async () => {
            const headers = new Headers()
            vi.mocked(auth.api.getSession).mockResolvedValue(null)

            await expect(service.me(headers)).rejects.toThrow(UnauthorizedError)
            await expect(service.me(headers)).rejects.toThrow('No active session')
        })

        it('should handle errors from getSession', async () => {
            const headers = new Headers()
            const sessionError = new Error('Session check failed')
            vi.mocked(auth.api.getSession).mockRejectedValue(sessionError)

            await expect(service.me(headers)).rejects.toThrow('Session check failed')
        })
    })
})
