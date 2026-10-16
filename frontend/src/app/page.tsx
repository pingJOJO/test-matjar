import React from 'react';
import { api, ProductItem } from '@/lib/api';
import { HomeClientView } from '@/components/home/HomeClientView';

// Force dynamic so it always fetches fresh catalog data from backend
export const dynamic = 'force-dynamic';

async function getFeaturedProducts(): Promise<ProductItem[]> {
  try {
    const res = await api.getProducts({ isFeatured: true, limit: 8 });
    return res.data || [];
  } catch (err) {
    console.error('Failed to fetch featured products:', err);
    return [];
  }
}

async function getFastMovingProducts(): Promise<ProductItem[]> {
  try {
    const res = await api.getProducts({ productSort: 'salesCount_desc', limit: 8 });
    return res.data || [];
  } catch (err) {
    console.error('Failed to fetch fast moving products:', err);
    return [];
  }
}

export default async function HomePage() {
  const [featuredParts, fastMovingParts] = await Promise.all([
    getFeaturedProducts(),
    getFastMovingProducts(),
  ]);

  return <HomeClientView featuredParts={featuredParts} fastMovingParts={fastMovingParts} />;
}
