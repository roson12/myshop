import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";

type OrderPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  PENDING: "bg-butter text-ink",
  PAID: "bg-mint text-ink",
  FULFILLED: "bg-sky text-ink",
  CANCELLED: "bg-peach text-ink",
};

const statusLabels: Record<string, string> = {
  PENDING: "Waiting for payment",
  PAID: "Paid",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
};

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const { id } = await params;
  const { session_id: sessionId } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-lavender-deep/30">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
          Order {order.id.slice(-8)}
        </p>
        <h1 className="mt-2 text-3xl font-bold">Thank you!</h1>
        <p className="mt-2 text-ink-soft">
          {order.status === "PENDING"
            ? "We are waiting for the payment provider to confirm this order. Refresh in a moment."
            : "This order has been recorded."}
        </p>

        <p
          className={`mt-4 inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${
            statusStyles[order.status] ?? "bg-lavender text-ink"
          }`}
        >
          {statusLabels[order.status] ?? order.status}
        </p>

        <div className="mt-6 divide-y divide-lavender-deep/30">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3">
              <div className="h-14 w-14 overflow-hidden rounded-xl bg-lavender/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageSnapshot}
                  alt={item.nameSnapshot}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.nameSnapshot}</p>
                <p className="text-sm text-ink-soft">
                  {item.quantity} × {formatMoney(item.priceCents)}
                </p>
              </div>
              <p className="font-semibold">
                {formatMoney(item.priceCents * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-lavender-deep/40 pt-4 text-lg font-semibold">
          <span>Total</span>
          <span>{formatMoney(order.totalCents)}</span>
        </div>

        {order.email ? (
          <p className="mt-4 text-sm text-ink-soft">Confirmation email: {order.email}</p>
        ) : null}

        {sessionId ? (
          <p className="mt-1 text-xs text-ink-soft">Stripe session: {sessionId}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-full bg-blush px-6 py-2.5 text-sm font-semibold text-white hover:bg-blush-dark"
        >
          Continue shopping
        </Link>
        <Link
          href={`/orders/${order.id}`}
          className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold ring-1 ring-lavender-deep/40 hover:bg-lavender/40"
        >
          Refresh status
        </Link>
      </div>
    </div>
  );
}
