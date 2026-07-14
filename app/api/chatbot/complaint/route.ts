import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { orderId, productId, description } = body;

    if (!orderId || !productId || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const complaint = await prisma.complaint.create({
      data: {
        orderId,
        productId,
        description,
        userId: session?.user?.id || null
      }
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error('Failed to create complaint:', error);
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 });
  }
}
