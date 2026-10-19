import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdminEnabled } from "@/lib/admin";
import { ProductForm } from "@/components/product-form";
import { deleteProduct, updateProduct } from "../../actions";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  if (!isAdminEnabled()) notFound();

  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin" className="text-sm font-medium text-ink-soft hover:text-ink">
        ← Back to admin
      </Link>
      <h1 className="text-3xl font-bold">Edit product</h1>

      <ProductForm
        action={updateProduct}
        categories={categories}
        productId={product.id}
        submitLabel="Save changes"
        values={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: (product.priceCents / 100).toFixed(2),
          stock: String(product.stock),
          imagePath: product.imagePath,
          active: product.active,
          categoryId: product.categoryId,
        }}
      />

      <form
        action={deleteProduct}
        className="rounded-2xl border border-peach bg-white p-4"
      >
        <input type="hidden" name="id" value={product.id} />
        <p className="text-sm text-ink-soft">
          Deleting keeps past order snapshots intact — order lines store their own
          name, image and price.
        </p>
        <button
          type="submit"
          className="mt-3 rounded-full bg-peach px-5 py-2 text-sm font-semibold hover:bg-lavender"
        >
          Delete product
        </button>
      </form>
    </div>
  );
}
