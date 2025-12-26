import { prisma } from "@/db/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user:{
    additionalFields:{
      schoolId: {
        type: 'string',
        // default: 'default'
      },
      role: { type: "string" }
    }
  }
});