import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdminEnabled } from "@/lib/admin";
import { ProductForm } from "@/components/product-form";
import { createProduct } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  if (!isAdminEnabled()) notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin" className="text-sm font-medium text-ink-soft hover:text-ink">
        ← Back to admin
      </Link>
      <h1 className="text-3xl font-bold">New product</h1>
      <ProductForm
        action={createProduct}
        categories={categories}
        submitLabel="Create product"
      />
    </div>
  );
}
