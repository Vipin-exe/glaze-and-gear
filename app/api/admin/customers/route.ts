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

    const customers = await prisma.user.findMany({
      include: {
        orders: {
          select: { totalAmount: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const enrichedCustomers = customers.map(c => {
      const orderCount = c.orders.length;
      const totalSpent = c.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        role: c.role,
        createdAt: c.createdAt,
        orderCount,
        totalSpent
      };
    });

    return NextResponse.json(enrichedCustomers);
  } catch (error) {
    console.error('Fetch Customers Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
