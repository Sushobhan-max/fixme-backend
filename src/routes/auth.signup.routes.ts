import express from "express";
import { signUp } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate"
import { signupSchema } from "../validators/auth.validator";
import { signupLimiter } from "../middlewares/rateLimiter";

const router = express.Router();

router.post("/", signupLimiter, validate(signupSchema), signUp);
export default router;