import { z } from "zod";

export const signupSchema = z.object({
    firstName: z.string().trim().min(2, "FirstName must be atleast 2 characters").max(50),
    lastName: z.string().trim().min(2, "LastName must be atleast 2 characters").max(50),
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain an uppercase letter")
        .regex(/[a-z]/, "Must contain a lowercase letter")
        .regex(/[0-9]/, "Must contain a number")
        .regex(/[!@#$%^&*(),.?\":{}|<>]/, "Must contain a special character")
});

export const verifySignUpSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    otp: z.string().regex(/^\d{4}$/, "OTP must be a 4-digit number"),
});

export const resendOtpSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    purpose: z.enum(["signup", "reset-password", "login"], { message: "Invalid purpose" })
});

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
})

export const forgotPasswordSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
})

export const verifyPasswordSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    otp: z.string().regex(/^\d{4}$/, "OTP must be a 4-digit number"),
})

export const resetPasswordSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain an uppercase letter")
        .regex(/[a-z]/, "Must contain a lowercase letter")
        .regex(/[0-9]/, "Must contain a number")
        .regex(/[!@#$%^&*(),.?\":{}|<>]/, "Must contain a special character")
})

