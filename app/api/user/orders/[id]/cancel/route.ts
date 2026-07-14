import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending orders can be cancelled' }, { status: 400 });
    }

    // Cancel order and restore stock in a transaction
    const isPaidRazorpay = order.paymentMethod !== 'COD' && order.paymentStatus === 'PAID';
    
    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { 
          status: 'CANCELLED',
          refundStatus: isPaidRazorpay ? 'PENDING' : undefined
        }
      }),
      ...order.items.map(item => 
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        })
      )
    ]);

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Order Cancellation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
