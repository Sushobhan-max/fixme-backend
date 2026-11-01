import express from "express";
import { resetPassword } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { resetPasswordSchema } from "../validators/auth.validator";
import { resetPassLimiter } from "../middlewares/rateLimiter";

const router = express.Router();

router.post("/", resetPassLimiter, validate(resetPasswordSchema), resetPassword);
export default router;