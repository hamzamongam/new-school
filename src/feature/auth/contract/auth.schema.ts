import z from "zod";

export const loginSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
})

export const RegisterSchoolSchema = z.object({
  // School information
  schoolName: z.string().min(3, "School name is required"),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug must be simple (e.g., oxford-int)"),
  
  // Admin information
  adminName: z.string().min(2),
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});


export type TLoginSchema = z.infer<typeof loginSchema>
export type RegisterSchoolInput = z.infer<typeof RegisterSchoolSchema>;