"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  ADMIN_COOKIE,
  adminSessionToken,
  checkAdminPassword,
  isAdminEnabled,
  requireAdmin,
} from "@/lib/admin";
import { dollarsToCents } from "@/lib/money";

const STATUSES = ["PENDING", "PAID", "FULFILLED", "CANCELLED"] as const;

async function ensureAdmin() {
  await requireAdmin();
}

export async function loginAdmin(formData: FormData) {
  if (!isAdminEnabled()) notFound();

  const password = field(formData, "password");
  if (!checkAdminPassword(password)) {
    redirect("/admin/login?error=1");
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, adminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/");
}

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueSlug(input: string, excludeId?: string): Promise<string> {
  const base = slugify(input) || `product-${Date.now()}`;
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function readProductForm(formData: FormData, slug: string) {
  const name = field(formData, "name");
  if (!name) throw new Error("Product name is required.");

  const categoryId = field(formData, "categoryId");
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new Error("Choose a valid category.");

  const priceCents = dollarsToCents(field(formData, "price") || "0");
  const stock = Math.max(0, Math.trunc(Number(field(formData, "stock") || "0")));
  const imagePath = field(formData, "imagePath") || "/products/placeholder.svg";

  return {
    name,
    slug,
    description: field(formData, "description"),
    priceCents,
    stock: Number.isFinite(stock) ? stock : 0,
    imagePath,
    active: formData.get("active") === "on",
    categoryId,
  };
}

function revalidateStore() {
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function createProduct(formData: FormData) {
  await ensureAdmin();

  const requestedSlug = field(formData, "slug") || field(formData, "name");
  const slug = await uniqueSlug(requestedSlug);
  const data = await readProductForm(formData, slug);

  await prisma.product.create({ data });
  revalidateStore();
  redirect("/admin");
}

export async function updateProduct(formData: FormData) {
  await ensureAdmin();

  const id = field(formData, "id");
  if (!id) throw new Error("Missing product id.");

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) notFound();

  const requestedSlug = field(formData, "slug");
  const slug = requestedSlug
    ? await uniqueSlug(requestedSlug, id)
    : existing.slug;
  const data = await readProductForm(formData, slug);

  await prisma.product.update({ where: { id }, data });
  revalidateStore();
  revalidatePath(`/products/${slug}`);
  redirect("/admin");
}

export async function deleteProduct(formData: FormData) {
  await ensureAdmin();

  const id = field(formData, "id");
  if (id) {
    await prisma.product.delete({ where: { id } });
  }

  revalidateStore();
  redirect("/admin");
}

export async function updateOrderStatus(formData: FormData) {
  await ensureAdmin();

  const id = field(formData, "id");
  const status = field(formData, "status");

  if (!id || !STATUSES.includes(status as (typeof STATUSES)[number])) {
    throw new Error("Invalid order update.");
  }

  const nextStatus = status as (typeof STATUSES)[number];

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) notFound();
    if (order.status === nextStatus) return;

    const leavingCancelled = order.status === "CANCELLED" && nextStatus !== "CANCELLED";
    const enteringCancelled = order.status !== "CANCELLED" && nextStatus === "CANCELLED";

    for (const item of order.items) {
      if (!item.productId) continue;

      if (enteringCancelled) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      if (leavingCancelled) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count !== 1) {
          throw new Error("Not enough stock to reopen this order.");
        }
      }
    }

    await tx.order.update({ where: { id }, data: { status: nextStatus } });
  });

  revalidatePath("/admin");
  redirect("/admin");
}
