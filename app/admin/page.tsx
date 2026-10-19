import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdminEnabled } from "@/lib/admin";
import { isStripeEnabled } from "@/lib/stripe";
import { formatMoney } from "@/lib/money";
import { deleteProduct, updateOrderStatus } from "./actions";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  PENDING: "bg-butter text-ink",
  PAID: "bg-mint text-ink",
  FULFILLED: "bg-sky text-ink",
  CANCELLED: "bg-peach text-ink",
};

export default async function AdminPage() {
  if (!isAdminEnabled()) notFound();

  const [products, orders] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
            Admin
          </p>
          <h1 className="text-3xl font-bold">Shop control room</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {isStripeEnabled()
              ? "Stripe test mode is configured."
              : "Demo checkout mode — no Stripe keys configured."}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-blush px-6 py-2.5 text-sm font-semibold text-white hover:bg-blush-dark"
        >
          Add product
        </Link>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Products ({products.length})</h2>
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-lavender-deep/30">
          <table className="w-full text-left text-sm">
            <thead className="bg-lavender/40 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lavender-deep/30">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{product.category.name}</td>
                  <td className="px-4 py-3">{formatMoney(product.priceCents)}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.active ? "bg-mint text-ink" : "bg-peach text-ink"
                      }`}
                    >
                      {product.active ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-sm underline hover:text-blush-dark"
                      >
                        Edit
                      </Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <button
                          type="submit"
                          className="text-sm text-ink-soft underline hover:text-ink"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent orders ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-sm text-ink-soft ring-1 ring-lavender-deep/30">
            No orders yet. Place one through the shop to see it here.
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-lavender-deep/30"
              >
                <div className="min-w-40 flex-1">
                  <p className="font-medium">
                    {order.email || "guest"} · {formatMoney(order.totalCents)}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} items ·{" "}
                    {order.createdAt.toLocaleString("en-US")}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    statusStyles[order.status] ?? "bg-lavender text-ink"
                  }`}
                >
                  {order.status}
                </span>

                <form action={updateOrderStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={order.id} />
                  <select
                    name="status"
                    defaultValue={order.status}
                    className="rounded-xl border border-lavender-deep/50 bg-cream px-3 py-2 text-sm"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                    <option value="FULFILLED">FULFILLED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-full bg-lavender px-4 py-2 text-xs font-semibold hover:bg-lavender-deep"
                  >
                    Save
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
