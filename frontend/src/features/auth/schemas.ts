import { z } from "zod";

export const loginSchema = z.object({ email: z.string().email("Enter a valid email."), password: z.string().min(1, "Enter your password.") });
export const signupSchema = loginSchema.extend({ display_name: z.string().min(1, "Enter your name.").max(120), password: z.string().min(10, "Use at least 10 characters.").regex(/[A-Za-z]/, "Include a letter.").regex(/\d/, "Include a number.") });
