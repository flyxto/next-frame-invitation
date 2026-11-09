import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const DASHBOARD_COOKIE = "nf_guest_book";

function tokenFor(password: string) {
  return createHmac("sha256", password).update("next-frame-guest-book").digest("hex");
}

function matches(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function dashboardPassword() {
  const value = process.env.DASHBOARD_PASSWORD?.trim();
  return value ? value : null;
}

export function dashboardKey() {
  const value = process.env.DASHBOARD_KEY?.trim();
  return value ? value : null;
}

export function dashboardKeyMatches(key: string) {
  const expected = dashboardKey();
  if (!expected) return false;
  return matches(key, expected);
}

export async function isDashboardAuthed() {
  const password = dashboardPassword();
  if (!password) return false;
  const jar = await cookies();
  const given = jar.get(DASHBOARD_COOKIE)?.value ?? "";
  return matches(given, tokenFor(password));
}

export function dashboardSessionValue() {
  const password = dashboardPassword();
  if (!password) return null;
  return tokenFor(password);
}
