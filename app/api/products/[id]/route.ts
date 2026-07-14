import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const product = await prisma.product.findUnique({
      where: isObjectId ? { id } : { slug: id },
      include: {
        reviews: {
          include: {
            user: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';

    if (!product || product.isArchived) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!isAdmin) {
      // Hide costPrice from regular users/guests
      delete (product as any).costPrice;
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, costPrice, image, category, stock, isFeatured } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        costPrice: costPrice !== undefined ? parseFloat(costPrice) : undefined,
        stock: stock !== undefined && stock !== null ? parseInt(stock) : undefined,
        isFeatured: isFeatured !== undefined ? isFeatured : undefined,
        image,
        category,
      },
    });

    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await prisma.adminAuditLog.create({
        data: {
          adminId: session.user.id,
          action: "UPDATE_PRODUCT",
          targetId: id,
          details: `Updated product ${name || id}`
        }
      });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.update({
      where: { id },
      data: { isArchived: true }
    });

    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await prisma.adminAuditLog.create({
        data: {
          adminId: session.user.id,
          action: "ARCHIVE_PRODUCT",
          targetId: id,
          details: `Soft deleted product ${id}`
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
