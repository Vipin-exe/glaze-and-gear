import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import { reviewSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = reviewSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { productId, rating, comment } = result.data;

    // Check if user purchased the product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: productId,
        order: {
          userId: session.user.id,
          status: 'DELIVERED'
        }
      }
    });

    if (!hasPurchased) {
      return NextResponse.json({ error: 'You can only review products you have purchased and received' }, { status: 403 });
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        productId: productId
      }
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 });
    }

    const newReview = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        userId: session.user.id,
        productId
      }
    });

    return NextResponse.json(newReview);
  } catch (error) {
    console.error('Review POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
