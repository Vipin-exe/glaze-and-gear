import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { getForgotPasswordTemplate } from "@/lib/email-templates";
import { forgotPasswordSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimit = await checkRateLimit(`forgot_${ip}`, 3, 15); // Max 3 requests per 15 minutes
    
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }
    
    const { email } = result.data;
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always return success even if user doesn't exist to prevent email enumeration
    if (!user) return NextResponse.json({ message: "If that email exists, we sent a reset link." });

    const token = uuidv4();
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { email, token, expires }
    });

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    
    // SEND EMAIL
    if (process.env.SMTP_HOST && process.env.SMTP_USER && !process.env.SMTP_HOST.includes("your_email")) {
      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const htmlBody = getForgotPasswordTemplate(resetLink);

      await transporter.sendMail({
        from: `"Glaze & Gear" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Password Reset - Glaze & Gear",
        html: htmlBody
      });
      console.log(`[REAL RESET EMAIL SENT TO] ${email}`);
    } else {
      // MOCK EMAIL SENDING
      console.log("-----------------------------------------");
      console.log(`[RESET EMAIL SENT TO] ${email}`);
      console.log(`[RESET LINK] ${resetLink}`);
      console.log("-----------------------------------------");
    }

    return NextResponse.json({ message: "If that email exists, we sent a reset link." });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
