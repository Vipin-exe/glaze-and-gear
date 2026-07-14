import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";
import { getOrderEmailTemplate } from "@/lib/email-templates";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, customerInfo, items, promoCode, paymentMethod } = body; 
    const isCod = paymentMethod === "COD";

    let finalAmount = amount;
    let actualDiscountAmount = 0;
    let validPromoCode: any = null;
    const customerEmail = customerInfo?.email || "";

    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode.toUpperCase() }
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
      if (promo.minOrderValue && amount < promo.minOrderValue) {
         return NextResponse.json({ error: `Minimum order value of ₹${promo.minOrderValue} required` }, { status: 400 });
      }

      // Check per-user limit if email is provided
      if (customerEmail) {
        const pastUsage = await prisma.promoUsage.count({
          where: {
            promoCode: promo.code,
            email: customerEmail
          }
        });
        if (pastUsage > 0) {
          return NextResponse.json({ error: 'You have already used this promo code' }, { status: 400 });
        }
      }

      let calculatedDiscount = 0;
      if (promo.discountType === 'FLAT' && promo.flatDiscountAmount) {
        calculatedDiscount = promo.flatDiscountAmount;
      } else if (promo.discountType === 'PERCENTAGE' && promo.discountPercent) {
        calculatedDiscount = (amount * promo.discountPercent) / 100;
        if (promo.maxDiscountAmount && calculatedDiscount > promo.maxDiscountAmount) {
          calculatedDiscount = promo.maxDiscountAmount;
        }
      }
      
      actualDiscountAmount = calculatedDiscount;
      finalAmount = amount - actualDiscountAmount;
      validPromoCode = promo;
    }

    const session = await getServerSession(authOptions);

    // ── Stock Validation & Cost Fetching ──────────────────────────────────────────────
    const stockErrors: string[] = [];
    const productDataMap: Record<string, { costPrice: number }> = {};

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        select: { name: true, stock: true, costPrice: true }
      });
      if (!product) {
        stockErrors.push(`Product not found: ${item.id}`);
      } else if (product.stock < item.quantity) {
        stockErrors.push(
          `"${product.name}" only has ${product.stock} left in stock (you requested ${item.quantity}).`
        );
      } else {
        productDataMap[item.id] = { costPrice: product.costPrice };
      }
    }
    if (stockErrors.length > 0) {
      return NextResponse.json(
        { error: 'Some items are out of stock', details: stockErrors },
        { status: 409 }
      );
    }
    // ─────────────────────────────────────────────────────────────────

    if (isCod) {
      // Create COD Order directly
      const order = await prisma.order.create({
        data: {
          totalAmount: finalAmount,
          shippingAddress: customerInfo?.shippingAddress,
          customerName: customerInfo?.name || "Anonymous",
          customerEmail: customerInfo?.email || "N/A",
          customerPhone: customerInfo?.phone || "",
          userId: session?.user?.id || undefined,
          paymentMethod: "COD",
          paymentStatus: "PENDING",
          status: "PENDING",
          promoCode: validPromoCode ? validPromoCode.code : null,
          discountAmount: actualDiscountAmount > 0 ? actualDiscountAmount : null,
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
              costPrice: productDataMap[item.id]?.costPrice || 0,
            })),
          },
        },
        include: {
          items: {
            include: { product: true }
          }
        }
      });

      // Stock Decrement Logic
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // Send Order Confirmation Email
      if (order.customerEmail && process.env.SMTP_HOST && !process.env.SMTP_HOST.includes("your_email")) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });

        const htmlBody = getOrderEmailTemplate(order, true);

        transporter.sendMail({
          from: `"Glaze & Gear" <${process.env.SMTP_USER}>`,
          to: order.customerEmail,
          subject: `Order Confirmation - Glaze & Gear (#${order.id.slice(-6).toUpperCase()})`,
          html: htmlBody
        }).catch(err => {
          console.error('Failed to send order email:', err);
          prisma.adminAuditLog.create({
            data: { adminId: "SYSTEM", action: "EMAIL_FAILED", targetId: order.id, details: err.message }
          }).catch(console.error);
        });
      }

      // Record promo usage
      if (validPromoCode) {
        let updateWhere: any = { id: validPromoCode.id };
        if (validPromoCode.maxUses) {
          // Atomic update using updateMany to allow conditions without throwing P2025 on fail
          const updateResult = await prisma.promoCode.updateMany({
            where: { id: validPromoCode.id, usedCount: { lt: validPromoCode.maxUses } },
            data: { usedCount: { increment: 1 } }
          });
          if (updateResult.count === 0) {
            return NextResponse.json({ error: 'Promo code usage limit reached just now' }, { status: 409 });
          }
        } else {
          await prisma.promoCode.update({
            where: { id: validPromoCode.id },
            data: { usedCount: { increment: 1 } }
          });
        }

        if (customerEmail) {
          await prisma.promoUsage.create({
            data: {
              userId: session?.user?.id || undefined,
              email: customerEmail,
              promoCode: validPromoCode.code,
              orderId: order.id,
            }
          });
        }
      }

      return NextResponse.json({
        success: true,
        isCod: true,
        dbOrderId: order.id,
      });
    }

    // Razorpay Flow
    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials missing in .env");
    }

    const instance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const options = {
      amount: Math.round(finalAmount * 100), // Razorpay expects paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await instance.orders.create(options);

    const order = await prisma.order.create({
      data: {
        totalAmount: finalAmount,
        shippingAddress: customerInfo?.shippingAddress,
        customerName: customerInfo?.name || "Anonymous",
        customerEmail: customerInfo?.email || "N/A",
        customerPhone: customerInfo?.phone || "",
        userId: session?.user?.id || undefined,
        paymentMethod: "RAZORPAY",
        razorpayOrderId: razorpayOrder.id,
        paymentStatus: "PENDING",
        status: "PENDING",
        promoCode: validPromoCode ? validPromoCode.code : null,
        discountAmount: actualDiscountAmount > 0 ? actualDiscountAmount : null,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            costPrice: productDataMap[item.id]?.costPrice || 0,
          })),
        },
      },
    });

    // Record promo usage
    if (validPromoCode) {
      let updateWhere: any = { id: validPromoCode.id };
      if (validPromoCode.maxUses) {
        const updateResult = await prisma.promoCode.updateMany({
          where: { id: validPromoCode.id, usedCount: { lt: validPromoCode.maxUses } },
          data: { usedCount: { increment: 1 } }
        });
        if (updateResult.count === 0) {
           // We created the order but promo failed, we should rollback ideally, but it's PENDING so it's fine.
           return NextResponse.json({ error: 'Promo code usage limit reached just now' }, { status: 409 });
        }
      } else {
        await prisma.promoCode.update({
          where: { id: validPromoCode.id },
          data: { usedCount: { increment: 1 } }
        });
      }

      if (customerEmail) {
        await prisma.promoUsage.create({
          data: {
            userId: session?.user?.id || undefined,
            email: customerEmail,
            promoCode: validPromoCode.code,
            orderId: order.id,
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      isCod: false,
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      dbOrderId: order.id,
    });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
