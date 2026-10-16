import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { Prisma, PrismaClient, ProductStatus } from '@prisma/client';

const execFileAsync = promisify(execFile);

type CategoryScope = 'top' | 'leaf' | 'all' | 'curated';

interface CliOptions {
  rootUrl?: string;
  categoryScope: CategoryScope;
  limitPerCategory: number;
  maxCategories: number;
  targetTotal: number;
  delayMs: number;
  downloadImages: boolean;
  cleanWatermark: boolean;
  importDb: boolean;
  outputPath: string;
  frontendPublicDir: string;
}

interface FridayCategory {
  id?: number;
  name?: string;
  url_key?: string;
  url_path?: string;
  image?: string | null;
  description?: string | null;
  short_description?: string | null;
  children?: FridayCategory[];
}

interface FridayPrice {
  final_price?: {
    currency?: string;
    value?: number;
  };
  regular_price?: {
    currency?: string;
    value?: number;
  };
}

interface FridayProductSummary {
  sku?: string;
  name?: string;
  url_key?: string;
}

interface FridayProductDetail extends FridayProductSummary {
  id?: number;
  uid?: string;
  stock_status?: string;
  only_x_left_in_stock?: number | null;
  origin_name?: string | null;
  rating_summary?: number | null;
  review_count?: number | null;
  cmodels?: string | null;
  engine_no?: string | null;
  original?: string | null;
  weight?: number | string | null;
  categories_breadcrumb?: Array<{
    id?: number;
    name?: string;
    url_path?: string;
  }>;
  thumbnail?: FridayImage | null;
  image?: FridayImage | null;
  media_gallery?: FridayImage[];
  price_range?: {
    minimum_price?: FridayPrice;
    maximum_price?: FridayPrice;
  };
  item_location_label?: string[];
  item_location_country_codes?: string[];
  brand_data?: string[];
  brand_group_data?: Array<Record<string, unknown>>;
  engine_brand_data?: string[];
  engine_group_data?: Array<Record<string, unknown>>;
  equipment_type_data?: string[];
  meta_description?: string | null;
  description?: {
    html?: string;
  } | null;
  short_description?: {
    html?: string;
  } | null;
  amasty_meta_data?: {
    short_description?: string;
  } | null;
}

interface FridayImage {
  url?: string;
  position?: number | null;
  disabled?: boolean | null;
  label?: string | null;
  default?: boolean | null;
}

interface CategoryTarget {
  name: string;
  slug: string;
  url: string;
  sourcePath: string;
}

interface NormalizedProduct {
  title: string;
  slug: string;
  sku: string;
  sourceUrl: string;
  sourceCategoryUrl: string;
  categoryPath: Array<{
    name: string;
    slug: string;
    sourceId?: number;
  }>;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  stock: number;
  weightKg?: number;
  images: Array<{
    sourceUrl: string;
    url: string;
    altText: string;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  attributes: Record<string, unknown>;
  tags: string[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '..');
const projectDir = path.resolve(backendDir, '..');

const stateKeys = {
  categoryData: '$sscoped:page:state:CategoryPage:categoryData',
  categoryProducts: '$sscoped:page:state:category-products',
  product: '$sscoped:page:state:product:product',
} as const;

const nuxtWrapperTags = new Set([
  'Reactive',
  'ShallowReactive',
  'Ref',
  'ShallowRef',
  'Readonly',
]);

const userAgent =
  'A2ZPartsImporter/1.0 (+local catalog seeding; contact: admin@atoz.local)';

// 10 Diverse Leaf Categories covering essential heavy equipment replacement parts
const curatedCategoryTargets: Array<{ name: string; slug: string; path: string }> = [
  { name: 'Water Pumps', slug: 'water-pumps', path: 'water-pump' },
  { name: 'Injectors & Nozzles', slug: 'injectors-nozzle', path: 'injectors-nozzle' },
  { name: 'Fuel Injection Pumps', slug: 'fuel-injection-pump', path: 'injection-pump' },
  { name: 'Turbochargers', slug: 'turbochargers', path: 'turbocharger' },
  { name: 'Starter Motors', slug: 'starters', path: 'starter-motor' },
  { name: 'Alternators', slug: 'alternators', path: 'alternator' },
  { name: 'Cylinder Heads', slug: 'cylinder-heads', path: 'cylinder-head' },
  { name: 'Hydraulic Pumps', slug: 'hydraulic-pumps', path: 'hydraulic-pump' },
  { name: 'Connecting Rods', slug: 'connecting-rods', path: 'connecting-rod' },
  { name: 'Pistons', slug: 'pistons', path: 'piston' },
];

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const origin = 'https://www.fridayparts.com';

  console.log(`Starting FridayParts catalog importer...`);
  console.log(`Target Total Products: ${options.targetTotal}`);
  console.log(`Download Images: ${options.downloadImages ? 'YES' : 'NO'}`);
  console.log(`Automated Watermark Removal: ${options.cleanWatermark ? 'YES' : 'NO'}`);
  console.log(`Prisma DB Upsert: ${options.importDb ? 'YES' : 'NO'}`);

  let targets: CategoryTarget[] = [];

  if (options.rootUrl) {
    console.log(`Discovering category tree from root URL: ${options.rootUrl}`);
    const { payload } = await fetchNuxtPage(options.rootUrl);
    const rootCategory = getState<FridayCategory>(
      payload,
      stateKeys.categoryData,
    );
    if (!rootCategory) {
      throw new Error(`No category payload found at ${options.rootUrl}`);
    }
    targets = selectCategoryTargets(rootCategory, options.categoryScope, origin);
  } else {
    console.log(`Using curated diverse heavy equipment leaf categories (${curatedCategoryTargets.length} categories)`);
    targets = curatedCategoryTargets.map((c) => ({
      name: c.name,
      slug: c.slug,
      sourcePath: c.path,
      url: new URL(`/${c.path}`, origin).href,
    }));
  }

  const selectedTargets =
    options.maxCategories > 0
      ? targets.slice(0, options.maxCategories)
      : targets;

  console.log(
    `Processing across ${selectedTargets.length} target categories (limit: ${options.limitPerCategory} per category)...`,
  );

  const products: NormalizedProduct[] = [];
  const processedSkus = new Set<string>();

  for (const target of selectedTargets) {
    if (products.length >= options.targetTotal) {
      console.log(`Reached target goal of ${options.targetTotal} products. Stopping search.`);
      break;
    }

    console.log(`\n========================================`);
    console.log(`Category: ${target.name} (${target.url})`);
    console.log(`========================================`);
    await sleep(options.delayMs);

    let summaries: FridayProductSummary[] = [];
    try {
      const { payload } = await fetchNuxtPage(target.url);
      summaries =
        getState<FridayProductSummary[]>(
          payload,
          stateKeys.categoryProducts,
        ) ?? [];
    } catch (err) {
      console.warn(`  Failed to fetch category ${target.url}: ${(err as Error).message}`);
      continue;
    }

    if (summaries.length === 0) {
      console.warn(`  No products found in category payload, skipping.`);
      continue;
    }

    const availableProducts = summaries.filter(
      (item) => item.url_key && item.name && item.sku && !processedSkus.has(normalizeSku(item.sku)),
    );

    const needed = options.targetTotal - products.length;
    const countToTake = Math.min(options.limitPerCategory, needed, availableProducts.length);
    const selectedProducts = availableProducts.slice(0, countToTake);

    console.log(`  Found ${availableProducts.length} candidate products. Scraping ${selectedProducts.length} items...`);

    for (const summary of selectedProducts) {
      if (products.length >= options.targetTotal) {
        break;
      }

      const productUrl = new URL(`/${summary.url_key}`, origin).href;
      console.log(`\n  -> [${products.length + 1}/${options.targetTotal}] Product: ${summary.name}`);
      console.log(`     URL: ${productUrl}`);
      await sleep(options.delayMs);

      try {
        const { payload, html } = await fetchNuxtPage(productUrl);
        const detail = getState<FridayProductDetail>(
          payload,
          stateKeys.product,
        );

        if (!detail?.sku || !detail.name || !detail.url_key) {
          console.warn(`     Missing required detail fields, skipping.`);
          continue;
        }

        const normalized = await normalizeProduct(
          detail,
          productUrl,
          target,
          options,
          html,
        );

        products.push(normalized);
        processedSkus.add(normalized.sku);
        console.log(`     Saved product: SKU ${normalized.sku} | Images: ${normalized.images.length}`);
      } catch (err) {
        console.warn(`     Failed to scrape product ${productUrl}: ${(err as Error).message}`);
      }
    }
  }

  const output = {
    generatedAt: new Date().toISOString(),
    totalProducts: products.length,
    importDb: options.importDb,
    imageMode: options.downloadImages ? 'local' : 'source-url',
    products,
  };

  await mkdir(path.dirname(options.outputPath), { recursive: true });
  await writeFile(
    options.outputPath,
    `${JSON.stringify(output, null, 2)}\n`,
    'utf8',
  );
  console.log(`\nSaved normalized import dataset to: ${options.outputPath}`);

  if (options.importDb) {
    console.log(`\nUpserting ${products.length} products into PostgreSQL via Prisma...`);
    await importProducts(products);
    console.log(`Database import completed successfully!`);
  } else {
    console.log(
      '\nDatabase import skipped. Run with --import-db to upsert into Prisma.',
    );
  }

  // Count total processed images
  const totalImages = products.reduce((acc, p) => acc + p.images.length, 0);
  console.log(`\n========================================`);
  console.log(`SUMMARY:`);
  console.log(`- Products Collected: ${products.length} / ${options.targetTotal}`);
  console.log(`- Total Gallery Images: ${totalImages}`);
  console.log(`- Watermark Cleaned: ${options.cleanWatermark ? 'YES' : 'NO'}`);
  console.log(`========================================\n`);
}

function parseArgs(args: string[]): CliOptions {
  const values = new Map<string, string | boolean>();

  for (const arg of args) {
    if (!arg.startsWith('--')) {
      continue;
    }

    const [key, rawValue] = arg.slice(2).split('=');
    values.set(key, rawValue ?? true);
  }

  const categoryScope = (
    values.has('category-scope')
      ? getString(values, 'category-scope', 'curated')
      : 'curated'
  ) as CategoryScope;

  const rootUrl = values.has('root-url')
    ? getString(values, 'root-url', '')
    : undefined;

  const outputPath = path.resolve(
    backendDir,
    getString(
      values,
      'output',
      'data/imports/fridayparts/heavy-equipment-50.sample.json',
    ),
  );

  const frontendPublicDir = path.resolve(
    projectDir,
    getString(values, 'frontend-public-dir', 'frontend/public'),
  );

  const targetTotal = getNumber(values, 'target-total', 50);
  const limitPerCategory = getNumber(values, 'limit-per-category', 5);

  return {
    rootUrl,
    categoryScope,
    limitPerCategory,
    maxCategories: getNumber(values, 'max-categories', 0),
    targetTotal,
    delayMs: getNumber(values, 'delay-ms', 350),
    downloadImages: !values.has('skip-images'),
    cleanWatermark: !values.has('skip-watermark'),
    importDb: values.has('import-db'),
    outputPath,
    frontendPublicDir,
  };
}

function getString(
  values: Map<string, string | boolean>,
  key: string,
  fallback: string,
) {
  const value = values.get(key);
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function getNumber(
  values: Map<string, string | boolean>,
  key: string,
  fallback: number,
) {
  const value = values.get(key);
  if (typeof value !== 'string') {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`--${key} must be a positive number`);
  }

  return parsed;
}

async function fetchNuxtPage(url: string) {
  const response = await fetch(url, {
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'accept-language': 'en-US,en;q=0.9',
      'user-agent': userAgent,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Fetch failed ${response.status} ${response.statusText}: ${url}`,
    );
  }

  const html = await response.text();
  const match = html.match(
    /<script type="application\/json" data-nuxt-data="nuxt-app" data-ssr="true" id="__NUXT_DATA__">([\s\S]*?)<\/script>/,
  );

  if (!match?.[1]) {
    throw new Error(`Nuxt payload not found in page: ${url}`);
  }

  const rawPayload = JSON.parse(match[1]) as unknown[];
  const payload = hydrateNuxtPayload(rawPayload) as { state?: Record<string, unknown> };

  return { payload, html };
}

function hydrateNuxtPayload(rawPayload: unknown[]) {
  const memo = new Map<number, unknown>();

  function hydrate(slot: unknown): unknown {
    if (slot === null || slot === undefined) {
      return slot;
    }

    if (typeof slot !== 'number') {
      return slot;
    }

    if (memo.has(slot)) {
      return memo.get(slot);
    }

    const value = rawPayload[slot];

    if (Array.isArray(value)) {
      const tag = value[0];
      if (typeof tag === 'string' && nuxtWrapperTags.has(tag)) {
        return hydrate(value[1]);
      }

      const hydratedArray: unknown[] = [];
      memo.set(slot, hydratedArray);

      for (const item of value) {
        hydratedArray.push(hydrate(item));
      }

      return hydratedArray;
    }

    if (value && typeof value === 'object') {
      const hydratedObject: Record<string, unknown> = {};
      memo.set(slot, hydratedObject);

      for (const [key, nested] of Object.entries(value)) {
        hydratedObject[key] = hydrate(nested);
      }

      return hydratedObject;
    }

    return value;
  }

  return hydrate(0);
}

function getState<T>(
  payload: { state?: Record<string, unknown> },
  key: string,
): T | undefined {
  return payload.state?.[key] as T | undefined;
}

function selectCategoryTargets(
  rootCategory: FridayCategory,
  scope: CategoryScope,
  origin: string,
) {
  const children = rootCategory.children ?? [];
  const baseCategories = children.length > 0 ? children : [rootCategory];

  if (scope === 'top') {
    return baseCategories.map((category) => toCategoryTarget(category, origin));
  }

  const targets: CategoryTarget[] = [];

  function visit(category: FridayCategory) {
    const categoryChildren = category.children ?? [];
    if (scope === 'all') {
      targets.push(toCategoryTarget(category, origin));
    }

    if (categoryChildren.length === 0 && scope === 'leaf') {
      targets.push(toCategoryTarget(category, origin));
    }

    for (const child of categoryChildren) {
      visit(child);
    }
  }

  for (const category of baseCategories) {
    visit(category);
  }

  return targets;
}

function toCategoryTarget(
  category: FridayCategory,
  origin: string,
): CategoryTarget {
  const name = category.name?.trim() || 'Imported Category';
  const sourcePath = category.url_path || category.url_key || slugify(name);
  const slug = slugify(sourcePath);

  return {
    name,
    slug,
    sourcePath,
    url: new URL(`/${sourcePath}`, origin).href,
  };
}

async function normalizeProduct(
  product: FridayProductDetail,
  productUrl: string,
  target: CategoryTarget,
  options: CliOptions,
  rawHtml?: string,
): Promise<NormalizedProduct> {
  const title = normalizeWhitespace(product.name ?? 'Untitled Product');
  const baseSlug = `fp-${slugify(product.url_key ?? title)}`;
  const slug = baseSlug;
  const sourceDescriptionHtml = product.description?.html ?? '';
  const shortDescriptionHtml =
    product.short_description?.html ??
    product.amasty_meta_data?.short_description ??
    product.meta_description ??
    title;
  const description = htmlToText(sourceDescriptionHtml || shortDescriptionHtml);
  const shortDescription = clipText(htmlToText(shortDescriptionHtml), 180);
  const price = product.price_range?.minimum_price?.final_price?.value ?? 0.01;
  const regularPrice = product.price_range?.minimum_price?.regular_price?.value;
  const compareAtPrice =
    regularPrice && regularPrice > price
      ? roundCurrency(regularPrice)
      : undefined;
  const currency =
    product.price_range?.minimum_price?.final_price?.currency ??
    product.price_range?.minimum_price?.regular_price?.currency ??
    'USD';
  const stock = normalizeStock(product);
  const weightKg = normalizeNumber(product.weight);
  const categoryPath = normalizeCategoryPath(product, target);
  const compatibleModels = splitCsv(product.cmodels);
  const engineModels = splitCsv(product.engine_no);
  const replacementPartNumbers = extractReplacementPartNumbers(description);
  const condition = extractLabeledValue(description, 'Condition') || 'Brand New';
  const fitmentNotes = extractFitmentNotes(description);
  const images = await normalizeImages(product, slug, target.slug, options, rawHtml);

  return {
    title,
    slug,
    sku: normalizeSku(product.sku ?? slug),
    sourceUrl: productUrl,
    sourceCategoryUrl: target.url,
    categoryPath,
    description,
    shortDescription,
    price: roundCurrency(price),
    compareAtPrice,
    currency,
    stock,
    weightKg,
    images,
    attributes: {
      source: {
        provider: 'FridayParts',
        url: productUrl,
        productId: product.id,
        uid: product.uid,
        scrapedAt: new Date().toISOString(),
      },
      sourceDescriptionHtml,
      originName: product.origin_name,
      condition,
      replacementPartNumbers,
      compatibleModels,
      engineModels,
      fitmentNotes,
      brandData: product.brand_data ?? [],
      brandGroupData: product.brand_group_data ?? [],
      engineBrandData: product.engine_brand_data ?? [],
      engineGroupData: product.engine_group_data ?? [],
      equipmentTypes: product.equipment_type_data ?? [],
      itemLocations: product.item_location_label ?? [],
      itemLocationCountryCodes: product.item_location_country_codes ?? [],
      stockStatus: product.stock_status,
      ratingSummary: product.rating_summary,
      reviewCount: product.review_count,
      sourceBreadcrumbs: categoryPath,
      manufacturer:
        product.brand_data?.[0] ??
        product.engine_brand_data?.[0] ??
        'Heavy Equipment Aftermarket OEM',
      originCountry: product.item_location_label?.[0] ?? 'USA / Global',
      warrantyMonths: 12,
      partType:
        product.origin_name ?? categoryPath.at(-1)?.name ?? 'Heavy Equipment Spare Part',
    },
    tags: buildTags(product, categoryPath),
  };
}

function normalizeSku(sku: string) {
  return sku.trim().replace(/\s+/g, '-');
}

function normalizeStock(product: FridayProductDetail) {
  if (product.stock_status !== 'IN_STOCK') {
    return 0;
  }

  if (
    typeof product.only_x_left_in_stock === 'number' &&
    Number.isFinite(product.only_x_left_in_stock)
  ) {
    return Math.max(0, Math.floor(product.only_x_left_in_stock));
  }

  return 10;
}

function normalizeNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeCategoryPath(
  product: FridayProductDetail,
  target: CategoryTarget,
) {
  const breadcrumbs = product.categories_breadcrumb ?? [];

  if (breadcrumbs.length === 0) {
    return [
      {
        name: target.name,
        slug: target.slug,
      },
    ];
  }

  return breadcrumbs
    .filter((item) => item.name)
    .map((item) => ({
      name: normalizeWhitespace(item.name ?? 'Imported Category'),
      slug: slugify(item.url_path ?? item.name ?? target.slug),
      sourceId: item.id,
    }));
}

async function normalizeImages(
  product: FridayProductDetail,
  productSlug: string,
  categorySlug: string,
  options: CliOptions,
  rawHtml?: string,
) {
  // Collect candidate images from all possible locations
  const candidates: Array<{
    url?: string;
    label?: string | null;
    default?: boolean | null;
    position?: number | null;
  }> = [];

  // 1. media_gallery entries
  if (Array.isArray(product.media_gallery)) {
    for (const img of product.media_gallery) {
      if (img?.url && !img.disabled) {
        candidates.push(img);
      }
    }
  }

  // 2. primary product image
  if (product.image?.url && !product.image.disabled) {
    candidates.push({ ...product.image, default: true, position: 0 });
  }

  // 3. thumbnail image
  if (product.thumbnail?.url && !product.thumbnail.disabled) {
    candidates.push({ ...product.thumbnail, position: 99 });
  }

  // 4. Raw HTML JSON-LD images
  if (rawHtml) {
    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    for (const match of rawHtml.matchAll(jsonLdRegex)) {
      try {
        const data = JSON.parse(match[1]);
        if (data.image) {
          const imgs = Array.isArray(data.image) ? data.image : [data.image];
          for (const u of imgs) {
            if (typeof u === 'string' && u.includes('/media/catalog/product/')) {
              candidates.push({ url: u });
            }
          }
        }
      } catch {}
    }
  }

  // Deduplicate candidates by base image path
  const uniqueImages = new Map<string, {
    url: string;
    label?: string | null;
    default?: boolean | null;
    position: number;
  }>();

  for (let i = 0; i < candidates.length; i++) {
    const item = candidates[i];
    if (!item.url) continue;

    const rawUrl = decodeHtmlEntities(item.url).trim();
    let cleanUrl = rawUrl;
    try {
      const parsed = new URL(cleanUrl);
      parsed.searchParams.delete('width');
      parsed.searchParams.delete('height');
      parsed.searchParams.delete('resize');
      cleanUrl = parsed.toString();
    } catch {
      cleanUrl = cleanUrl.replace(/[?&](width|height)=\d+/g, '');
    }

    let key = cleanUrl;
    try {
      key = new URL(cleanUrl).pathname.toLowerCase();
    } catch {
      key = cleanUrl.split('?')[0].toLowerCase();
    }

    if (!uniqueImages.has(key)) {
      uniqueImages.set(key, {
        url: cleanUrl,
        label: item.label,
        default: item.default ?? (i === 0),
        position: item.position ?? i,
      });
    }
  }

  // Sort by position / default status
  const sorted = Array.from(uniqueImages.values()).sort((a, b) => {
    if (a.default && !b.default) return -1;
    if (!a.default && b.default) return 1;
    return a.position - b.position;
  });

  const normalizedImages = [];
  let index = 0;

  for (const item of sorted) {
    const sourceUrl = item.url;
    const altText = normalizeWhitespace(
      item.label ?? product.name ?? productSlug,
    );

    const localUrl = options.downloadImages
      ? await downloadImage(
          sourceUrl,
          categorySlug,
          productSlug,
          index,
          options,
        )
      : sourceUrl;

    normalizedImages.push({
      sourceUrl,
      url: localUrl,
      altText,
      isPrimary: index === 0,
      sortOrder: index,
    });

    index += 1;
  }

  return normalizedImages;
}

async function downloadImage(
  imageUrl: string,
  categorySlug: string,
  productSlug: string,
  index: number,
  options: CliOptions,
): Promise<string> {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        accept:
          'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'user-agent': userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    const extension = imageExtension(imageUrl, contentType);
    const imageHash = createHash('sha1')
      .update(imageUrl)
      .digest('hex')
      .slice(0, 8);
    const fileName = `${productSlug}-${String(index + 1).padStart(2, '0')}-${imageHash}${extension}`;
    const relativeDir = path.posix.join('imports', 'fridayparts', categorySlug);
    const absoluteDir = path.join(
      options.frontendPublicDir,
      ...relativeDir.split('/'),
    );
    const absolutePath = path.join(absoluteDir, fileName);

    await mkdir(absoluteDir, { recursive: true });
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(absolutePath, buffer);

    // Apply automated watermark cleaning
    if (options.cleanWatermark) {
      await cleanImageWatermark(absolutePath);
    }

    return `/${path.posix.join(relativeDir, fileName)}`;
  } catch (error) {
    console.warn(`       Image download warning, using source URL: ${imageUrl}`);
    console.warn(`       ${(error as Error).message}`);
    return imageUrl;
  }
}

async function cleanImageWatermark(filePath: string): Promise<boolean> {
  const pythonScript = path.resolve(__dirname, 'clean-watermark.py');
  try {
    await execFileAsync('python', [pythonScript, filePath, filePath], {
      timeout: 25000,
    });
    return true;
  } catch (err) {
    console.warn(`       Watermark clean warning for ${path.basename(filePath)}: ${(err as Error).message}`);
    return false;
  }
}

function imageExtension(imageUrl: string, contentType: string) {
  const pathname = new URL(imageUrl).pathname;
  const extension = path.extname(pathname).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(extension)) {
    return extension;
  }

  if (contentType.includes('png')) {
    return '.png';
  }

  if (contentType.includes('webp')) {
    return '.webp';
  }

  if (contentType.includes('gif')) {
    return '.gif';
  }

  return '.jpg';
}

function buildTags(
  product: FridayProductDetail,
  categoryPath: NormalizedProduct['categoryPath'],
) {
  const tags = new Set<string>();

  for (const category of categoryPath) {
    tags.add(category.slug);
  }

  for (const value of [
    product.origin_name,
    ...(product.brand_data ?? []),
    ...(product.engine_brand_data ?? []),
    ...(product.equipment_type_data ?? []),
  ]) {
    if (value) {
      tags.add(slugify(value));
    }
  }

  return Array.from(tags).filter(Boolean);
}

async function importProducts(products: NormalizedProduct[]) {
  const prisma = new PrismaClient();

  try {
    for (const product of products) {
      const categoryId = await ensureCategoryPath(prisma, product.categoryPath);
      const imagesData = product.images.map((image) => ({
        url: image.url,
        altText: image.altText,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
      }));

      await prisma.product.upsert({
        where: { sku: product.sku },
        update: {
          title: product.title,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription,
          price: new Prisma.Decimal(product.price),
          compareAtPrice:
            product.compareAtPrice !== undefined
              ? new Prisma.Decimal(product.compareAtPrice)
              : null,
          currency: product.currency,
          stock: product.stock,
          categoryId,
          status: ProductStatus.ACTIVE,
          attributes: toJsonInput(product.attributes),
          tags: product.tags,
          weightKg:
            product.weightKg !== undefined
              ? new Prisma.Decimal(product.weightKg)
              : null,
          images: {
            deleteMany: {},
            create: imagesData,
          },
        },
        create: {
          title: product.title,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          shortDescription: product.shortDescription,
          price: new Prisma.Decimal(product.price),
          compareAtPrice:
            product.compareAtPrice !== undefined
              ? new Prisma.Decimal(product.compareAtPrice)
              : null,
          currency: product.currency,
          stock: product.stock,
          categoryId,
          status: ProductStatus.ACTIVE,
          attributes: toJsonInput(product.attributes),
          tags: product.tags,
          weightKg:
            product.weightKg !== undefined
              ? new Prisma.Decimal(product.weightKg)
              : null,
          images: {
            create: imagesData,
          },
        },
      });

      console.log(`  [DB UPSERTED] ${product.sku} | "${product.title.slice(0, 50)}..." | ${imagesData.length} images`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function ensureCategoryPath(
  prisma: PrismaClient,
  categoryPath: NormalizedProduct['categoryPath'],
) {
  let parentId: string | null = null;
  let lastCategoryId: string | null = null;

  for (let index = 0; index < categoryPath.length; index += 1) {
    const category = categoryPath[index];
    const result = (await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        parentId,
        isActive: true,
        order: index,
      },
      create: {
        name: category.name,
        slug: category.slug,
        parentId,
        isActive: true,
        order: index,
        description:
          index === 0
            ? 'Heavy Equipment Parts Catalog Category'
            : undefined,
      },
    })) as { id: string };

    parentId = result.id;
    lastCategoryId = result.id;
  }

  return lastCategoryId;
}

function htmlToText(html: string) {
  return decodeHtmlEntities(html)
    .replace(/<br\b[^>]*>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .split('\n')
    .map((line) => normalizeWhitespace(line))
    .filter(Boolean)
    .join('\n');
}

function extractReplacementPartNumbers(description: string) {
  const section = extractSection(description, 'Replacement Part Number');
  return splitCsv(section);
}

function extractFitmentNotes(description: string) {
  return description
    .split('\n')
    .map((line) => normalizeWhitespace(line))
    .filter((line) => /^(fit\s+for|applications?:)/i.test(line));
}

function extractLabeledValue(description: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = description.match(new RegExp(`${escaped}:\\s*([^\\n]+)`, 'i'));
  return match?.[1]?.trim();
}

function extractSection(description: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `${escaped}:?\\s*([\\s\\S]*?)(?=\\n(?:[A-Z][A-Za-z /&-]{2,45}:|Fit For|Applications?:)|$)`,
    'i',
  );
  return pattern.exec(description)?.[1]?.trim() ?? '';
}

function splitCsv(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(/[,;\n]/)
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean);
}

function clipText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function slugify(value: string) {
  return decodeHtmlEntities(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    );
}

function toJsonInput(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

await main().catch((error) => {
  console.error(error);
  process.exit(1);
});
