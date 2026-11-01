import { Response, Request } from "express";
import { User } from "../models/user.model";
import { Otp } from "../models/otp.model";
import generateOtp from "../utils/generateOtp";
import { sendOtpEmail } from "../utils/sendEmail";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";

export const signUp = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists && userExists.isVerified) {
            return res.status(400).json({ message: "User already exists" });
        }
        if (userExists && !userExists.isVerified) {
            await Otp.deleteMany({ email, purpose: "signup" });
            const otp = generateOtp();
            await Otp.create({ email, otp, purpose: "signup" });
            await sendOtpEmail(email, otp);
            return res.status(200).json({ message: "OTP resent successfully" });
        }

        await User.create({ firstName, lastName, email, password });
        const otp = generateOtp();
        await Otp.create({ email, otp, purpose: "signup" });
        await sendOtpEmail(email, otp);
        res.status(201).json({ message: "User created successfully" });

    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message })
        }
        else {
            res.status(500).json({ message: "something went wrong" })
        }
    }
};

export const verifySignUp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        const isOtpInDB = await Otp.findOne({ email, otp, purpose: "signup" });
        if (!isOtpInDB) {
            return res.status(400).json({ message: "OTP not found or expired" })
        }

        await User.updateOne({ email }, { isVerified: true });
        await Otp.deleteOne({ _id: isOtpInDB._id });
        res.status(200).json({ message: "Email verified successfully" });
    } catch (error: unknown) {
        if (error instanceof Error) {   
            res.status(500).json({ message: error.message })
        }
        else {
            res.status(500).json({ message: "something went wrong" })
        }
    }
};

export const resendOtp = async (req: Request, res: Response) => {
    try {
        const { email, purpose } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if (purpose === "signup" && user.isVerified) {
            return res.status(400).json({ message: "User already verified" });
        }

        await Otp.deleteMany({ email, purpose });
        const otp = generateOtp();
        await Otp.create({ email, otp, purpose });
        await sendOtpEmail(email, otp);

        res.status(200).json({ message: "OTP resent successfully" });

    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "something went wrong" });
        }
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const isUserExists = await User.findOne({ email });

        if (!isUserExists) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (!isUserExists.isVerified) {
            return res.status(403).json({ message: 'User not verified yet, Please verify your email first.' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, isUserExists.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const accessToken = jwt.sign(
            { userId: isUserExists._id },
            process.env.JWT_ACCESS_SECRET!,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"] }
        );
        const refreshToken = jwt.sign(
            { userId: isUserExists._id },
            process.env.JWT_REFRESH_SECRET!,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"] }
        );

        res.cookie('refreshTokenRes', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            accessToken,
            user: {
                id: isUserExists._id,
                firstName: isUserExists.firstName,
                lastName: isUserExists.lastName,
                email: isUserExists.email,
            },
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message })
        } else {
            res.status(500).json({ message: "something went wrong" })
        }
    }
};

export const refreshTokenFunc = async (req: Request, res: Response) => {
    const token = req.cookies.refreshTokenRes;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
    try {
        const refreshTokenVerify = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string };
        const userExists = await User.findOne({ _id: refreshTokenVerify.userId });
        if (!userExists) {
            return res.status(401).json({ message: "User not exists" });
        }
        const accessToken = jwt.sign(
            { userId: refreshTokenVerify.userId },
            process.env.JWT_ACCESS_SECRET!,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"] }
        );
        res.status(200).json({ accessToken });

    } catch {
        res.status(401).json({ message: 'refresh token is not valid' })
    }
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie('refreshTokenRes', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {

        const { email } = req.body;
        const isEmailExists = await User.findOne({ email });
        if (!isEmailExists) {
            return res.status(404).json({ message: "User not found" });
        }
        if (isEmailExists && !isEmailExists.isVerified) {
            return res.status(403).json({ message: "User not verified" });
        }

        await Otp.deleteMany({ email, purpose: 'reset-password' });
        const otp = generateOtp();
        await Otp.create({ email, otp, purpose: 'reset-password' });
        await sendOtpEmail(email, otp);
        res.status(200).json({ message: "OTP sent successfully" });

    } catch (error: unknown) {

        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: "something went wrong" });
        }
    }
};

export const verifyPassword = async (req: Request, res: Response) => {
    try {

        const { email, otp } = req.body;
        const isOtpInDB = await Otp.findOne({ email, otp, purpose: "reset-password" });
        if (!isOtpInDB) {
            return res.status(400).json({ message: "OTP not found or expired" })
        }
        await Otp.deleteOne({ _id: isOtpInDB._id });
        res.status(200).json({ message: "OTP verified successfully" });

    } catch (error: unknown) {

        if (error instanceof Error) {
            res.status(500).json({ message: error.message })
        }
        else {
            res.status(500).json({ message: "something went wrong" })
        }
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {

        const { email, newPassword } = req.body;
        const isEmailExists = await User.findOne({ email });
        if (!isEmailExists) {
            return res.status(404).json({ message: "User not found" });
        }
        const newHash = await bcrypt.hash(newPassword, 12);
        await User.updateOne({ email }, { password: newHash });
        res.status(200).json({ message: "password reset successfully" });

    } catch (error: unknown) {

        if (error instanceof Error) {
            res.status(500).json({ message: error.message })
        }
        else {
            res.status(500).json({ message: "something went wrong" })
        }
    }
};