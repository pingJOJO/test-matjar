import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BRANDS = [
  { key: 'CAT', patterns: [/\bcaterpillar\b/i, /\bcat\b/i] },
  { key: 'KOMATSU', patterns: [/\bkomatsu\b/i] },
  { key: 'JOHN DEERE', patterns: [/\bjohn deere\b/i, /\bdeere\b/i] },
  { key: 'VOLVO', patterns: [/\bvolvo\b/i] },
  { key: 'KUBOTA', patterns: [/\bkubota\b/i] },
  { key: 'HYUNDAI', patterns: [/\bhyundai\b/i] },
  { key: 'DOOSAN', patterns: [/\bdoosan\b/i] },
  { key: 'BOBCAT', patterns: [/\bbobcat\b/i] },
  { key: 'JCB', patterns: [/\bjcb\b/i] },
  { key: 'HITACHI', patterns: [/\bhitachi\b/i] },
  { key: 'CASE', patterns: [/\bcase\b/i] },
  { key: 'YANMAR', patterns: [/\byanmar\b/i] },
];

const EQUIPMENT_TYPES = [
  { key: 'Excavator', patterns: [/\bexcavator\b/i, /حفار/i, /\b320d\b/i, /\bpc200\b/i, /\bpc300\b/i] },
  { key: 'Wheel Loader', patterns: [/\bwheel loader\b/i, /\bloader\b/i, /لودر/i, /\b966h\b/i, /\b950h\b/i, /\b980h\b/i] },
  { key: 'Tractor', patterns: [/\btractor\b/i, /جرار/i] },
  { key: 'Engine', patterns: [/\bengine\b/i, /محرك/i, /\blong block\b/i, /\bshort block\b/i, /\boverhaul\b/i, /\brebuild kit\b/i] },
  { key: 'Bulldozer', patterns: [/\bbulldozer\b/i, /\bdozer\b/i, /بلدوزر/i, /\bd65\b/i, /\bd85\b/i, /\bd155\b/i] },
  { key: 'Forklift', patterns: [/\bforklift\b/i, /رافعة شوكية/i] },
  { key: 'Generator', patterns: [/\bgenerator\b/i, /\bgenset\b/i, /مولد/i] },
  { key: 'Truck', patterns: [/\btruck\b/i, /شاحنة/i] },
  { key: 'Marine', patterns: [/\bmarine\b/i, /بحري/i] },
  { key: 'Sport UTV/ATV', patterns: [/\butv\b/i, /\batv\b/i, /\bskid steer\b/i, /بوبكات/i] },
];

const ENGINE_BRANDS = [
  { key: 'CUMMINS', patterns: [/\bcummins\b/i, /\bqsb\b/i, /\bisx\b/i, /\b6bt\b/i] },
  { key: 'ISUZU', patterns: [/\bisuzu\b/i, /\b4hk1\b/i, /\b6hk1\b/i] },
  { key: 'CAT', patterns: [/\bcaterpillar\b/i, /\bc7\b/i, /\bc9\b/i, /\bc13\b/i, /\bc15\b/i, /\b3406\b/i] },
  { key: 'DEUTZ', patterns: [/\bdeutz\b/i] },
  { key: 'PERKINS', patterns: [/\bperkins\b/i, /\b1104d\b/i, /\b1106d\b/i] },
  { key: 'YANMAR', patterns: [/\byanmar\b/i, /\b4tnv\b/i, /\b3tnv\b/i] },
  { key: 'MITSUBISHI', patterns: [/\bmitsubishi\b/i] },
  { key: 'KUBOTA', patterns: [/\bkubota\b/i, /\bv2203\b/i, /\bv2403\b/i] },
];

async function main() {
  const products = await prisma.product.findMany({
    include: { category: true },
  });

  console.log(`Analyzing ${products.length} products with strict word boundary matching...`);

  let count = 0;
  for (const product of products) {
    // Only search in title, manufacturer attribute, and category name
    const title = product.title || '';
    const mfg = (product.attributes as any)?.manufacturer || '';
    const categoryName = product.category?.name || '';
    const searchTarget = `${title} ${mfg} ${categoryName}`;

    let brand = 'OTHER BRAND';
    for (const b of BRANDS) {
      if (b.patterns.some((pat) => pat.test(searchTarget))) {
        brand = b.key;
        break;
      }
    }

    let equipmentType = 'Engine';
    for (const eq of EQUIPMENT_TYPES) {
      if (eq.patterns.some((pat) => pat.test(searchTarget))) {
        equipmentType = eq.key;
        break;
      }
    }

    let engineBrand = 'Other Engine Brand';
    for (const eng of ENGINE_BRANDS) {
      if (eng.patterns.some((pat) => pat.test(searchTarget))) {
        engineBrand = eng.key;
        break;
      }
    }
    if (engineBrand === 'Other Engine Brand' && (brand === 'CAT' || brand === 'KUBOTA' || brand === 'YANMAR')) {
      engineBrand = brand;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { brand, equipmentType, engineBrand },
    });
    count++;
  }

  console.log(`[SUCCESS] Re-enriched ${count} products with accurate boundaries.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
