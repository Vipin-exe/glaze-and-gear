import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired verification link." }, { status: 400 });
    }

    // Verify user
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() }
    });

    // Delete token so it can't be used again
    await prisma.verificationToken.delete({
      where: { token }
    });

    return NextResponse.json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 });
  }
}
