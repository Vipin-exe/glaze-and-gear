import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimit = await checkRateLimit(`promo_${ip}`, 10, 15); // Max 10 attempts per 15 mins
    
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many promo code attempts. Please try again later." }, { status: 429 });
    }

    const { code, cartTotal, userEmail } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!promo || !promo.isActive) {
      return NextResponse.json({ error: 'Invalid or inactive promo code' }, { status: 400 });
    }

    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return NextResponse.json({ error: 'Promo code has expired' }, { status: 400 });
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 });
    }

    if (promo.minOrderValue && cartTotal !== undefined && cartTotal < promo.minOrderValue) {
      return NextResponse.json({ error: `Minimum order value of ₹${promo.minOrderValue} required` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      discountType: promo.discountType,
      discountPercent: promo.discountPercent,
      flatDiscountAmount: promo.flatDiscountAmount,
      maxDiscountAmount: promo.maxDiscountAmount || null
    });
  } catch (error) {
    console.error('Promo validation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
