import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { code, discountType, discountPercent, flatDiscountAmount, isActive, expiresAt, maxUses, minOrderValue, maxDiscountAmount } = body;

    const promo = await prisma.promoCode.update({
      where: { id },
      data: { 
        code: code ? code.toUpperCase() : undefined,
        discountType: discountType,
        discountPercent: discountType === 'PERCENTAGE' ? (discountPercent ? Number(discountPercent) : null) : null,
        flatDiscountAmount: discountType === 'FLAT' ? (flatDiscountAmount ? Number(flatDiscountAmount) : null) : null,
        isActive: isActive !== undefined ? isActive : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        minOrderValue: minOrderValue ? Number(minOrderValue) : null,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null
      }
    });

    return NextResponse.json(promo);
  } catch (error) {
    console.error('Update Promo Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.promoCode.delete({
      where: { id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Delete Promo Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
