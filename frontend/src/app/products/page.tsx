import React from 'react';
import { api, ProductItem, CategoryItem } from '@/lib/api';
import { ProductsClientView } from '@/components/products/ProductsClientView';

export const dynamic = 'force-dynamic';

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    categorySlug?: string;
    inStockOnly?: string;
    productSort?: string;
    brand?: string;
    equipmentType?: string;
    engineBrand?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || '';
  const categorySlug = resolvedParams.categorySlug || '';
  const inStockOnly = resolvedParams.inStockOnly === 'true';
  const productSort = resolvedParams.productSort || 'newest';
  const brand = resolvedParams.brand || '';
  const equipmentType = resolvedParams.equipmentType || '';
  const engineBrand = resolvedParams.engineBrand || '';

  // Fetch products, categories, and featured products concurrently
  const [productsRes, categoriesRes, featuredRes] = await Promise.all([
    api
      .getProducts({
        search,
        categorySlug,
        inStockOnly,
        productSort,
        brand,
        equipmentType,
        engineBrand,
        limit: 40,
      })
      .catch(() => ({ success: false, data: [] as ProductItem[], meta: null })),
    api.getCategories().catch(() => ({ success: false, data: [] as CategoryItem[] })),
    api
      .getProducts({ isFeatured: true, limit: 4 })
      .catch(() => ({ success: false, data: [] as ProductItem[], meta: null })),
  ]);

  const products = productsRes.data || [];
  const categories = categoriesRes.data || [];
  const featuredProducts = featuredRes.data || [];

  return (
    <ProductsClientView
      products={products}
      categories={categories}
      featuredProducts={featuredProducts}
      search={search}
      categorySlug={categorySlug}
      inStockOnly={inStockOnly}
      productSort={productSort}
      brand={brand}
      equipmentType={equipmentType}
      engineBrand={engineBrand}
    />
  );
}
