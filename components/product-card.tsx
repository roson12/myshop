import Link from "next/link";
import { AddToCart } from "./add-to-cart";
import { formatMoney } from "@/lib/money";

type ProductCardProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    priceCents: number;
    stock: number;
    imagePath: string;
    category: { name: string };
  };
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-lavender-deep/30">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square w-full overflow-hidden bg-lavender/40">
          {/* Local SVG art, so plain img keeps next/image config simple. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imagePath}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
          {product.category.name}
        </p>
        <h2 className="text-base font-semibold leading-snug">
          <Link href={`/products/${product.slug}`} className="hover:text-blush-dark">
            {product.name}
          </Link>
        </h2>
        <p className="line-clamp-2 text-sm text-ink-soft">{product.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="text-lg font-semibold">{formatMoney(product.priceCents)}</span>
          <AddToCart product={product} />
        </div>
      </div>
    </article>
  );
}
