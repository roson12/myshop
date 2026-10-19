import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { AddToCart } from "@/components/add-to-cart";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || !product.active) notFound();

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm font-medium text-ink-soft hover:text-ink">
        ← Back to shop
      </Link>

      <div className="grid gap-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-lavender-deep/30 sm:grid-cols-2 sm:p-8">
        <div className="aspect-square overflow-hidden rounded-3xl bg-lavender/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imagePath}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
            {product.category.name}
          </p>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold text-blush-dark">
            {formatMoney(product.priceCents)}
          </p>
          <p className="text-ink-soft">{product.description}</p>
          <p className="text-sm text-ink-soft">
            {product.stock > 0
              ? `${product.stock} in stock`
              : "Currently sold out"}
          </p>
          <div>
            <AddToCart product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
