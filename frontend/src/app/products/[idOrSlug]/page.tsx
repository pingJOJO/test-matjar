import React from 'react';
import { notFound } from 'next/navigation';
import { api, ProductItem } from '@/lib/api';
import { ProductDetailClientView } from '@/components/product/ProductDetailClientView';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: Promise<{
    idOrSlug: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { idOrSlug } = await params;

  let product: ProductItem | null = null;
  try {
    const res = await api.getProduct(idOrSlug);
    if (res.success && res.data) {
      product = res.data;
    }
  } catch (err) {
    console.error('Failed to fetch product:', err);
  }

  if (!product) {
    notFound();
  }

  return <ProductDetailClientView product={product} />;
}
