import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('authRouter', () => {
    beforeEach(() => {
        vi.resetModules()
        vi.clearAllMocks()
    })

    it('should call authService.login in the login handler', async () => {
        const mockLogin = vi.fn()
        vi.doMock('../services/auth.service', () => ({
            AuthService: vi.fn().mockImplementation(() => ({
                login: mockLogin
            }))
        }))

        const { authRouter } = await import('./auth.router')

        const input = { email: 'test@example.com', password: 'password123' }
        const mockResp = { user: { id: '1' }, session: { id: 's1' } }
        mockLogin.mockResolvedValue(mockResp as any)

        // @ts-ignore
        const result = await authRouter.login['~orpc'].handler({ input, context: {} })

        expect(mockLogin).toHaveBeenCalledWith(input)
        expect(result).toEqual(mockResp)
    })

    it('should call authService.registerSchool in the registerSchool handler', async () => {
        const mockRegister = vi.fn()
        vi.doMock('../services/auth.service', () => ({
            AuthService: vi.fn().mockImplementation(() => ({
                registerSchool: mockRegister
            }))
        }))

        const { authRouter } = await import('./auth.router')

        const input = {
            schoolName: 'Test Academy',
            slug: 'test-academy',
            adminName: 'Admin User',
            email: 'admin@test.com',
            password: 'password123',
        }
        const mockResp = { success: true, school: { id: 's1' }, user: { id: 'u1' } }
        mockRegister.mockResolvedValue(mockResp as any)

        // @ts-ignore
        const result = await authRouter.registerSchool['~orpc'].handler({ input, context: {} })

        expect(mockRegister).toHaveBeenCalledWith(input)
        expect(result).toEqual(mockResp)
    })

    it('should call authService.me in the me handler', async () => {
        const mockMe = vi.fn()
        vi.doMock('../services/auth.service', () => ({
            AuthService: vi.fn().mockImplementation(() => ({
                me: mockMe
            }))
        }))

        const { authRouter } = await import('./auth.router')

        const headers = new Headers()
        const mockResp = { user: { id: '1' }, session: { id: 's1' } }
        mockMe.mockResolvedValue(mockResp as any)

        // @ts-ignore
        const result = await authRouter.me['~orpc'].handler({ input: undefined, context: { headers } })

        expect(mockMe).toHaveBeenCalledWith(headers)
        expect(result).toEqual(mockResp)
    })
})
