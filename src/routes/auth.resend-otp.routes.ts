import express from "express";
import { resendOtp } from "../controllers/auth.controller";
import { resendOtpSchema } from "../validators/auth.validator";
import { validate } from "../middlewares/validate";
import { verifyOtpLimit } from "../middlewares/rateLimiter";

const router = express.Router();
router.post("/", verifyOtpLimit, validate(resendOtpSchema), resendOtp);

export default router;