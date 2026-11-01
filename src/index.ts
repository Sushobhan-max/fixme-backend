import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { connectDB } from './config/db.js'
import authSignupRoutes from './routes/auth.signup.routes.js';
import otpVerificationRoutes from './routes/auth.otp-signup.routes.js';
import resendOtpRoutes from './routes/auth.resend-otp.routes.js';
import authLoginRoutes from './routes/auth.login.routes.js'
import authTokenRoutes from './routes/auth.tokens.routes.js'
import authLogoutRoutes from './routes/auth.logout.routes.js'
import authForgotPass from './routes/auth.forgotpass.routes.js'
import authVerifyPass from './routes/auth.verifypass.routes.js'
import authResetPass from './routes/auth.resetpass.routes.js'
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

const app: Express = express();
const port = process.env.PORT || 3000;
app.use(helmet());

app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
}))
app.use(express.json());
app.use(cookieParser());
await connectDB();

app.use('/api/v1/auth/signup', authSignupRoutes);
app.use('/api/v1/auth/signup/verify-otp', otpVerificationRoutes);
app.use('/api/v1/auth/resend-otp', resendOtpRoutes);
app.use('/api/v1/auth/login', authLoginRoutes);
app.use('/api/v1/auth/authToken', authTokenRoutes);
app.use('/api/v1/auth/logout', authLogoutRoutes);
app.use('/api/v1/auth/forgot-password', authForgotPass);
app.use('/api/v1/auth/verify-password', authVerifyPass);
app.use('/api/v1/auth/reset-password', authResetPass);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ message: "Internal server error" });
});
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

