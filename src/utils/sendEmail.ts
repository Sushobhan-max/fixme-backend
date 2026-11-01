import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendOtpEmail = async (email: string, otp: string) => {
    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Your OTP Code',
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #0a0a0a; padding: 40px 0; min-height: 100vh;">
            <div style="max-width: 480px; margin: 0 auto; background-color: #111111; border-radius: 12px; overflow: hidden; border: 1px solid #222222;">
                
                <div style="background-color: #111111; padding: 18px; text-align: center; border-bottom: 2px solid #e11d48;">
                    <img src="https://res.cloudinary.com/echoofsushh/image/upload/v1790439410/fixme/fixme_logo.png" alt="Fixme Logo" style="height: 48px; object-fit: contain;" />
                </div>

                <div style="padding: 40px 32px;">
                    <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 8px 0;">Verify your email</h1>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 32px 0;">Use the OTP below to complete your signup. It expires in 5 minutes.</p>

                    <div style="background-color: #1a1a1a; border: 1px solid #e11d48; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 32px;">
                        <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">Your OTP Code</p>
                        <p style="color: #e11d48; font-size: 42px; font-weight: 800; letter-spacing: 12px; margin: 0;">${otp}</p>
                    </div>

                    <p style="color: #6b7280; font-size: 13px; margin: 0;">If you didn't request this, you can safely ignore this email.</p>
                </div>

                <div style="background-color: #0a0a0a; padding: 20px 32px; text-align: center; border-top: 1px solid #222222;">
                    <p style="color: #4b5563; font-size: 12px; margin: 0;">© 2025 Fixme. All rights reserved.</p>
                </div>

            </div>
        </div>
        `,
    });
};
