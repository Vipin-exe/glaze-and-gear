import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isFeatured = searchParams.get('isFeatured');
    const maxPrice = searchParams.get('maxPrice');

    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';

    let products = await prisma.product.findMany({
      where: {
        ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
        ...(isFeatured === 'true' ? { isFeatured: true } : {}),
        ...(maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!isAdmin) {
      // Filter in JS to safely handle MongoDB missing boolean fields
      products = products.filter((p: any) => p.isArchived !== true);
      products.forEach((p: any) => delete p.costPrice);
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, costPrice, image, category, stock, isFeatured } = body;

    if (!name || price == null) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slug = `${baseSlug}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        costPrice: costPrice ? parseFloat(costPrice) : 0,
        image,
        category,
        stock: stock ? parseInt(stock) : 0,
        isFeatured: isFeatured === true || isFeatured === 'true',
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: session.user.id,
        action: "CREATE_PRODUCT",
        targetId: product.id,
        details: `Created product ${product.name}`
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
