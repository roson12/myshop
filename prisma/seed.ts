import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://pastel:pastel@localhost:5432/pastel_shop?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const categories = [
  { name: "Home", slug: "home" },
  { name: "Stationery", slug: "stationery" },
  { name: "Bath & Body", slug: "bath" },
  { name: "Accessories", slug: "accessories" },
];

const products = [
  {
    name: "Cloud Mug",
    slug: "cloud-mug",
    description:
      "A soft lavender ceramic mug with a rounded handle. Holds 350 ml of your favourite slow morning.",
    priceCents: 1800,
    stock: 12,
    imagePath: "/products/cloud-mug.svg",
    category: "home",
  },
  {
    name: "Mint Sprig Notebook",
    slug: "mint-sprig-notebook",
    description:
      "A5 dot-grid notebook with a mint cover and 120 pages of thick cream paper.",
    priceCents: 1200,
    stock: 30,
    imagePath: "/products/mint-notebook.svg",
    category: "stationery",
  },
  {
    name: "Peach Scented Candle",
    slug: "peach-candle",
    description:
      "Hand-poured soy candle with notes of peach, vanilla and warm sugar. Burns for about 40 hours.",
    priceCents: 2400,
    stock: 8,
    imagePath: "/products/peach-candle.svg",
    category: "home",
  },
  {
    name: "Lavender Bath Soak",
    slug: "lavender-bath-soak",
    description:
      "A calming blend of Epsom salts, lavender buds and oat milk. One scoop per bath.",
    priceCents: 2200,
    stock: 15,
    imagePath: "/products/lavender-soak.svg",
    category: "bath",
  },
  {
    name: "Sky Blue Scarf",
    slug: "sky-scarf",
    description:
      "A lightweight woven scarf in pale blue, finished with soft fringed ends.",
    priceCents: 3200,
    stock: 6,
    imagePath: "/products/sky-scarf.svg",
    category: "accessories",
  },
  {
    name: "Rose Clay Bowl",
    slug: "rose-clay-bowl",
    description:
      "A small hand-thrown bowl in dusty rose clay. Perfect for rings, keys or a handful of berries.",
    priceCents: 2800,
    stock: 10,
    imagePath: "/products/rose-bowl.svg",
    category: "home",
  },
  {
    name: "Butter Yellow Tote",
    slug: "butter-tote",
    description:
      "A sturdy cotton-canvas tote in butter yellow with an inner pocket and long handles.",
    priceCents: 2600,
    stock: 20,
    imagePath: "/products/butter-tote.svg",
    category: "accessories",
  },
  {
    name: "Sage Desk Planter",
    slug: "sage-planter",
    description:
      "A tiny sage-green planter for a desk companion. Drainage hole and saucer included.",
    priceCents: 1900,
    stock: 9,
    imagePath: "/products/sage-planter.svg",
    category: "home",
  },
  {
    name: "Honey Lip Balm",
    slug: "honey-lip-balm",
    description:
      "Beeswax and honey lip balm in a pastel tin. Subtly sweet, never sticky.",
    priceCents: 900,
    stock: 40,
    imagePath: "/products/honey-balm.svg",
    category: "bath",
  },
  {
    name: "Periwinkle Pen Set",
    slug: "periwinkle-pens",
    description:
      "Three smooth gel pens in periwinkle, lilac and cloud grey. 0.5 mm tips.",
    priceCents: 1400,
    stock: 25,
    imagePath: "/products/periwinkle-pens.svg",
    category: "stationery",
  },
];

async function main() {
  const categoryIds = new Map<string, string>();

  for (const category of categories) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
    categoryIds.set(category.slug, row.id);
  }

  for (const product of products) {
    const { category, ...data } = product;
    const categoryId = categoryIds.get(category);
    if (!categoryId) throw new Error(`Unknown category: ${category}`);

    await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: { ...data, categoryId },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
