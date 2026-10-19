import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/product-card";

type HomeProps = {
  searchParams: Promise<{ category?: string }>;
};

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: HomeProps) {
  const { category } = await searchParams;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: {
        active: true,
        ...(category ? { category: { slug: category } } : {}),
      },
      include: { category: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const activeCategory = categories.find((item) => item.slug === category);

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-lavender via-peach to-mint p-8 sm:p-12">
        <p className="mb-3 inline-block rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink-soft">
          Soft things, small prices
        </p>
        <h1 className="max-w-xl text-4xl font-bold leading-tight sm:text-5xl">
          A little shop in your favourite pastel colours.
        </h1>
        <p className="mt-4 max-w-lg text-ink-soft">
          Mugs, notebooks, candles and other gentle everyday things. Add a few to
          your cart and try the demo checkout.
        </p>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              category
                ? "bg-white text-ink-soft ring-1 ring-lavender-deep/40 hover:bg-lavender/40"
                : "bg-ink text-white"
            }`}
          >
            All
          </Link>
          {categories.map((item) => (
            <Link
              key={item.id}
              href={`/?category=${item.slug}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                category === item.slug
                  ? "bg-ink text-white"
                  : "bg-white text-ink-soft ring-1 ring-lavender-deep/40 hover:bg-lavender/40"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <h2 className="text-2xl font-semibold">
          {activeCategory ? activeCategory.name : "Everything"}
        </h2>

        {products.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-ink-soft ring-1 ring-lavender-deep/30">
            Nothing here yet. Try another category.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
