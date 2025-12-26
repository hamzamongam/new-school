import z from "zod";

export const loginSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
})

export const RegisterSchoolSchema = z.object({
  // സ്കൂൾ വിവരങ്ങൾ
  schoolName: z.string().min(3, "സ്കൂൾ പേര് നിർബന്ധമാണ്"),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug ലളിതമായിരിക്കണം (eg: oxford-int)"),
  
  // അഡ്മിൻ വിവരങ്ങൾ
  adminName: z.string().min(2),
  email: z.string().email("കൃത്യമായ ഇമെയിൽ നൽകുക"),
  password: z.string().min(8, "പാസ്‌വേഡിന് കുറഞ്ഞത് 8 അക്ഷരങ്ങൾ വേണം"),
});


export type TLoginSchema = z.infer<typeof loginSchema>
export type RegisterSchoolInput = z.infer<typeof RegisterSchoolSchema>;