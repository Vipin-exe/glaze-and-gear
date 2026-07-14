import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'DELIVERED') {
      return NextResponse.json({ 
        error: 'Order is not delivered yet.',
        isEligible: false,
        status: order.status
      });
    }

    // Check if delivered within last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Assuming updatedAt represents the time it was marked as DELIVERED
    if (order.updatedAt < sevenDaysAgo) {
      return NextResponse.json({ 
        error: 'Order was delivered more than 7 days ago and is no longer eligible for return/complaint.',
        isEligible: false
      });
    }

    return NextResponse.json({
      isEligible: true,
      order: {
        id: order.id,
        items: order.items
      }
    });
  } catch (error) {
    console.error('Failed to fetch order eligibility:', error);
    return NextResponse.json({ error: 'Failed to process request or invalid ID format' }, { status: 500 });
  }
}
