import Link from "next/link";
import type { Category } from "@/lib/generated/prisma/client";

export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  imagePath: string;
  active: boolean;
  categoryId: string;
};

type ProductFormProps = {
  action: (formData: FormData) => Promise<void>;
  categories: Category[];
  values?: Partial<ProductFormValues>;
  productId?: string;
  submitLabel: string;
};

export function ProductForm({
  action,
  categories,
  values = {},
  productId,
  submitLabel,
}: ProductFormProps) {
  return (
    <form action={action} className="space-y-5 rounded-3xl bg-white p-6 ring-1 ring-lavender-deep/30">
      {productId ? <input type="hidden" name="id" value={productId} /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Name
          <input
            name="name"
            required
            defaultValue={values.name ?? ""}
            className="mt-1 w-full rounded-xl border border-lavender-deep/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-blush"
          />
        </label>

        <label className="block text-sm font-medium">
          Slug (optional)
          <input
            name="slug"
            defaultValue={values.slug ?? ""}
            placeholder="generated-from-name"
            className="mt-1 w-full rounded-xl border border-lavender-deep/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-blush"
          />
        </label>
      </div>

      <label className="block text-sm font-medium">
        Description
        <textarea
          name="description"
          rows={3}
          defaultValue={values.description ?? ""}
          className="mt-1 w-full rounded-xl border border-lavender-deep/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-blush"
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block text-sm font-medium">
          Price (USD)
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={values.price ?? "0.00"}
            className="mt-1 w-full rounded-xl border border-lavender-deep/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-blush"
          />
        </label>

        <label className="block text-sm font-medium">
          Stock
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={values.stock ?? "0"}
            className="mt-1 w-full rounded-xl border border-lavender-deep/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-blush"
          />
        </label>

        <label className="block text-sm font-medium">
          Category
          <select
            name="categoryId"
            required
            defaultValue={values.categoryId ?? ""}
            className="mt-1 w-full rounded-xl border border-lavender-deep/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-blush"
          >
            <option value="" disabled>
              Choose…
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm font-medium">
        Image path
        <input
          name="imagePath"
          defaultValue={values.imagePath ?? "/products/placeholder.svg"}
          className="mt-1 w-full rounded-xl border border-lavender-deep/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-blush"
        />
        <span className="mt-1 block text-xs font-normal text-ink-soft">
          Use one of the files in <code>public/products/</code>, for example
          <code> /products/mint-notebook.svg</code>.
        </span>
      </label>

      <label className="flex items-center gap-3 text-sm font-medium">
        <input
          type="checkbox"
          name="active"
          defaultChecked={values.active ?? true}
          className="h-4 w-4 accent-blush"
        />
        Visible in the shop
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-blush px-6 py-2.5 text-sm font-semibold text-white hover:bg-blush-dark"
        >
          {submitLabel}
        </button>
        <Link href="/admin" className="text-sm text-ink-soft underline hover:text-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
