import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
import { getOrderEmailTemplate } from "@/lib/email-templates";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Missing Razorpay Secret");

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Re-check stock to see if it sold out while payment was pending
    const dbOrder = await prisma.order.findUnique({
      where: { id: dbOrderId },
      include: { items: { include: { product: true } } }
    });
    
    if (!dbOrder) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    let outOfStock = false;
    for (const item of dbOrder.items) {
      if (item.product.stock < item.quantity) outOfStock = true;
    }

    // Mark as PAID
    const order = await prisma.order.update({
      where: { id: dbOrderId },
      data: {
        paymentStatus: "PAID",
        status: outOfStock ? "REQUIRES_ATTENTION" : "PENDING",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
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

    if (outOfStock) {
      await prisma.adminAuditLog.create({
        data: {
          adminId: "SYSTEM",
          action: "OVERSOLD_ORDER",
          targetId: order.id,
          details: "Order was paid but items were out of stock. Stock went negative."
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

      const htmlBody = getOrderEmailTemplate(order, false);

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
      console.log(`[ORDER CONFIRMATION SENT TO] ${order.customerEmail}`);
    } else {
      console.log(`[MOCK ORDER CONFIRMATION SENT TO] ${order.customerEmail}`);
    }

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Failed to verify payment:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
