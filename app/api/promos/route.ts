import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(promos);
  } catch (error) {
    console.error('Fetch Promos Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { code, discountType, discountPercent, flatDiscountAmount, isActive, expiresAt, maxUses, minOrderValue, maxDiscountAmount } = body;

    if (!code || (discountType === 'PERCENTAGE' && discountPercent == null) || (discountType === 'FLAT' && flatDiscountAmount == null)) {
      return NextResponse.json({ error: 'Missing required fields for discount' }, { status: 400 });
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        discountType: discountType || 'PERCENTAGE',
        discountPercent: discountType === 'PERCENTAGE' ? Number(discountPercent) : null,
        flatDiscountAmount: discountType === 'FLAT' ? Number(flatDiscountAmount) : null,
        isActive: isActive !== undefined ? isActive : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        minOrderValue: minOrderValue ? Number(minOrderValue) : null,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null
      }
    });

    return NextResponse.json(promo);
  } catch (error: any) {
    console.error('Create Promo Error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Promo code already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
