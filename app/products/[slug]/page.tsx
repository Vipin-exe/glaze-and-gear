import { Metadata, ResolvingMetadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import prisma from '@/lib/prisma';

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  
  // Try to find the product
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
  const product = await prisma.product.findUnique({
    where: isObjectId ? { id: slug } : { slug },
  });

  if (!product) {
    return {
      title: 'Product Not Found - Glaze & Gear'
    }
  }

  return {
    title: `${product.name} - Glaze & Gear`,
    description: product.description || `Buy ${product.name} from Glaze & Gear.`,
    openGraph: {
      title: product.name,
      description: product.description || `Buy ${product.name} from Glaze & Gear.`,
      images: product.image ? [product.image] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}