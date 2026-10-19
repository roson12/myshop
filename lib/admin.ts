import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

export const ADMIN_COOKIE = "xorem_admin";
const DEFAULT_SESSION_SECRET = "xorem-shop-demo-session-secret";

export function isAdminEnabled(): boolean {
  return process.env.ADMIN_ENABLED !== "false";
}

export function adminPasswordRequired(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return !expected || input === expected;
}

export function adminSessionToken(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || DEFAULT_SESSION_SECRET;
  return createHmac("sha256", secret).update("xorem-admin-session").digest("hex");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  const expected = adminSessionToken();
  const given = Buffer.from(token);
  const wanted = Buffer.from(expected);
  return given.length === wanted.length && timingSafeEqual(given, wanted);
}

/**
 * Server-side guard for Admin pages and actions. Disabled admin wins over a
 * valid session. Unauthenticated visitors are sent to the login page.
 */
export async function requireAdmin(): Promise<void> {
  if (!isAdminEnabled()) notFound();
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
}
