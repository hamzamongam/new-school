import { vi } from 'vitest'

// Mock Prisma
vi.mock('@/db/prisma', () => ({
  prisma: {
    school: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}))

// Mock Better-Auth
vi.mock('@/server/auth', () => ({
  auth: {
    api: {
      signInEmail: vi.fn(),
      signUpEmail: vi.fn(),
      getSession: vi.fn(),
    },
  },
}))
