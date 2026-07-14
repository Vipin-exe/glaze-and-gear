import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } }
      }
    });

    // Generate CSV
    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Shipping Address',
      'Total Amount',
      'Status',
      'Payment Method',
      'Payment Status',
      'Items (Qty x Product)'
    ];

    const rows = orders.map(order => {
      const itemsString = order.items.map(item => `${item.quantity}x ${item.product?.name?.replace(/,/g, '') || 'Unknown'}`).join(' | ');
      return [
        order.id,
        new Date(order.createdAt).toISOString(),
        `"${(order.customerName || '').replace(/"/g, '""')}"`,
        `"${(order.customerEmail || '').replace(/"/g, '""')}"`,
        `"${(order.customerPhone || '').replace(/"/g, '""')}"`,
        `"${(order.shippingAddress || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        order.totalAmount,
        order.status,
        order.paymentMethod || 'RAZORPAY',
        order.paymentStatus || (order.paymentMethod === 'COD' ? 'PENDING' : 'PAID'),
        `"${itemsString.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="glaze-gear-orders-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Export Orders Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
