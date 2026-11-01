import rateLimit from "express-rate-limit";


const createRateLimiter = (message: string) => rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // limit each IP to 5 requests per windowMs
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message },
})

export const signupLimiter = createRateLimiter("Too many signup attempts, please try again later.");
export const verifyOtpLimit = createRateLimiter("Too many OTP attempts, please try again later.");
export const logInLimiter = createRateLimiter("Too many login attempts, please try again later.");
export const forgotPassLimiter = createRateLimiter("Too many forgot password attempts, please try again later.");
export const verifyPassLimiter = createRateLimiter("Too many verify password attempts, please try again later.");
export const resetPassLimiter = createRateLimiter("Too many reset password attempts, please try again later.");