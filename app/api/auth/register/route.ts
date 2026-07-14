import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimit = await checkRateLimit(`register_${ip}`, 5, 15);
    
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { name, email, password } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Make the first user an ADMIN, others CUSTOMER
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "ADMIN" : "CUSTOMER";

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });

    const { v4: uuidv4 } = require("uuid");
    const token = uuidv4();
    const expires = new Date(Date.now() + 24 * 3600 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    });

    const verifyLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
    
    // SEND VERIFICATION EMAIL
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

      await transporter.sendMail({
        from: `"Glaze & Gear" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verify your email - Glaze & Gear",
        html: `
          <h2>Welcome to Glaze & Gear!</h2>
          <p>Please click the link below to verify your email address:</p>
          <a href="${verifyLink}" style="display:inline-block;padding:10px 20px;background-color:#98202E;color:white;text-decoration:none;border-radius:5px;font-weight:bold;">Verify Email</a>
          <p>Or copy this link: <br> ${verifyLink}</p>
        `
      });
      console.log(`[REAL EMAIL SENT TO] ${email}`);
    } else {
      // MOCK EMAIL SENDING
      console.log("-----------------------------------------");
      console.log(`[VERIFICATION EMAIL SENT TO] ${email}`);
      console.log(`[VERIFY LINK] ${verifyLink}`);
      console.log("-----------------------------------------");
    }

    return NextResponse.json({ message: "User registered! Please check your email to verify your account." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
