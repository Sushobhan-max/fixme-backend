import express from "express";
import { login } from "../controllers/auth.controller";
import { logInLimiter } from "../middlewares/rateLimiter";
import { loginSchema } from "../validators/auth.validator";
import { validate } from "../middlewares/validate";

const router = express.Router();
router.post("/", logInLimiter, validate(loginSchema), login);
export default router;