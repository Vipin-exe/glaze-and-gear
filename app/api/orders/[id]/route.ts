import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { getShippingEmailTemplate } from '@/lib/email-templates';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, trackingNumber, refundStatus } = body;

    if (!status && trackingNumber === undefined && !refundStatus) {
      return NextResponse.json({ error: 'status, trackingNumber, or refundStatus is required' }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (refundStatus) updateData.refundStatus = refundStatus;

    // If cancelling a paid order, set refundStatus to PENDING automatically
    if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
      const isPaidRazorpay = existingOrder.paymentMethod !== 'COD' && existingOrder.paymentStatus === 'PAID';
      if (isPaidRazorpay && !updateData.refundStatus) {
        updateData.refundStatus = 'PENDING';
      }
    }

    let order;

    if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
      // Transaction to cancel order and restore stock
      const result = await prisma.$transaction([
        prisma.order.update({
          where: { id },
          data: updateData,
          include: { items: { include: { product: true } } }
        }),
        ...existingOrder.items.map(item => 
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          })
        )
      ]);
      order = result[0];
    } else {
      order = await prisma.order.update({
        where: { id },
        data: updateData,
        include: { items: { include: { product: true } } }
      });
    }

    // Log admin action if status changed
    if (status && status !== existingOrder.status) {
      // Note: In a real app we'd get adminId from session. Here we use a generic string if no session.
      // But we should ideally get session.
      try {
        const { getServerSession } = require("next-auth/next");
        const { authOptions } = require("@/lib/auth");
        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
          await prisma.adminAuditLog.create({
            data: {
              adminId: session.user.id,
              action: `ORDER_STATUS_CHANGED_TO_${status}`,
              targetId: id,
              details: `Tracking: ${trackingNumber || 'N/A'}`
            }
          });
        }
      } catch (e) {
        console.error("Failed to log audit", e);
      }
    }

    if (status === 'SHIPPED' && order.customerEmail && process.env.SMTP_HOST && !process.env.SMTP_HOST.includes("your_email")) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const htmlBody = getShippingEmailTemplate(order);

      // Send email asynchronously in the background (non-blocking)
      transporter.sendMail({
        from: `"Glaze & Gear" <${process.env.SMTP_USER}>`,
        to: order.customerEmail,
        subject: `Your order has shipped! - Glaze & Gear (#${order.id.slice(-6).toUpperCase()})`,
        html: htmlBody
      }).catch(err => {
        console.error('Failed to send shipping email in background:', err);
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to update order status:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
