import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";
import { getOrderEmailTemplate } from "@/lib/email-templates";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret || !signature) {
      return NextResponse.json({ error: "Missing secret or signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      // Find the order
      const dbOrder = await prisma.order.findFirst({
        where: { razorpayOrderId },
        include: { items: { include: { product: true } } }
      });

      if (!dbOrder) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // If already marked as PAID via the client verify route, just return 200
      if (dbOrder.paymentStatus === "PAID") {
        return NextResponse.json({ success: true, message: "Order already paid" });
      }

      // Check stock
      let outOfStock = false;
      for (const item of dbOrder.items) {
        if (item.product.stock < item.quantity) outOfStock = true;
      }

      // Update Order
      const updatedOrder = await prisma.order.update({
        where: { id: dbOrder.id },
        data: {
          paymentStatus: "PAID",
          status: outOfStock ? "REQUIRES_ATTENTION" : "PENDING",
          razorpayPaymentId,
        },
        include: { items: { include: { product: true } } }
      });

      // Stock Decrement Logic
      for (const item of updatedOrder.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      if (outOfStock) {
        await prisma.adminAuditLog.create({
          data: {
            adminId: "SYSTEM",
            action: "OVERSOLD_ORDER_WEBHOOK",
            targetId: updatedOrder.id,
            details: "Webhook captured payment but items were out of stock. Stock went negative."
          }
        });
      }

      // Send Order Confirmation Email
      if (updatedOrder.customerEmail && process.env.SMTP_HOST && !process.env.SMTP_HOST.includes("your_email")) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });

        const htmlBody = getOrderEmailTemplate(updatedOrder, false);

        transporter.sendMail({
          from: `"Glaze & Gear" <${process.env.SMTP_USER}>`,
          to: updatedOrder.customerEmail,
          subject: `Order Confirmation - Glaze & Gear (#${updatedOrder.id.slice(-6).toUpperCase()})`,
          html: htmlBody
        }).catch(err => {
          console.error('Failed to send order email in webhook:', err);
          prisma.adminAuditLog.create({
            data: { adminId: "SYSTEM", action: "EMAIL_FAILED", targetId: updatedOrder.id, details: err.message }
          }).catch(console.error);
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
