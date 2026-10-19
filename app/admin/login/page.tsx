import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  adminPasswordRequired,
  isAdminAuthenticated,
  isAdminEnabled,
} from "@/lib/admin";
import { loginAdmin } from "../actions";

export const dynamic = "force-dynamic";

type AdminLoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  if (!isAdminEnabled()) notFound();
  if (await isAdminAuthenticated()) redirect("/admin");

  const { error } = await searchParams;
  const needsPassword = adminPasswordRequired();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <Link href="/" className="text-sm font-medium text-ink-soft hover:text-ink">
        ← Back to shop
      </Link>

      <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-lavender-deep/30">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold">Log in to manage the shop</h1>
        <p className="mt-3 text-sm text-ink-soft">
          {needsPassword
            ? "Enter the admin password configured for this shop."
            : "This demo has no admin password set. Press the button to sign in."}
        </p>

        <form action={loginAdmin} className="mt-6 space-y-4">
          {needsPassword ? (
            <label className="block text-sm font-medium">
              Password
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-xl border border-lavender-deep/50 bg-cream px-4 py-2.5 text-sm outline-none focus:border-blush"
              />
            </label>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-full bg-blush px-6 py-3 text-sm font-semibold text-white transition hover:bg-blush-dark"
          >
            Login as admin
          </button>
        </form>

        {error ? (
          <p className="mt-4 rounded-xl bg-peach px-4 py-3 text-sm text-ink">
            That password was not correct. Try again.
          </p>
        ) : null}
      </div>
    </div>
  );
}
