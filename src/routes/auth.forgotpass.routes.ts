import express from "express";
import { forgotPassword } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { forgotPasswordSchema } from "../validators/auth.validator";
import { forgotPassLimiter } from "../middlewares/rateLimiter";

const router = express.Router();

router.post("/", forgotPassLimiter, validate(forgotPasswordSchema), forgotPassword);
export default router;