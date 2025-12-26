import { prisma } from "@/db/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { tanstackStartCookie } from "./plugin/tanstack-start-cookies";
export const auth = betterAuth({
  emailAndPassword:{
    enabled:true
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    	tanstackStartCookie(),
    // emailPassword(),
  ],
  user:{
    additionalFields:{
      schoolId: {
        type: 'string',
        // default: 'default'
      },
      role: { 	type: ["schoolAdmin", "member", "teacher", "student", "superAdmin"], }
    }
  }
});