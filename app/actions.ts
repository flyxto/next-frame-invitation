"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  DASHBOARD_COOKIE,
  dashboardKey,
  dashboardPassword,
  dashboardSessionValue,
  isDashboardAuthed,
} from "./lib/dashboard-auth";
import { clampCompanions, cleanName, isTitle } from "./lib/guest";
import { createGuest as insertGuest, deleteGuest as removeGuest, saveRsvp } from "./lib/guests";
import { databaseErrorMessage } from "./lib/mongodb";

export type LoginState = { error?: string } | null;
export type CreateState = {
  error?: string;
  ok?: boolean;
  displayName?: string;
  code?: string;
} | null;
export type RsvpState = { error?: string; ok?: boolean } | null;
export type DeleteState = { error?: string } | null;

function refreshDashboard() {
  const key = dashboardKey();
  if (key) revalidatePath(`/dashboard/${key}`);
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14,
  };
}

export async function loginDashboard(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const expected = dashboardPassword();
  if (!expected) {
    return { error: "Set DASHBOARD_PASSWORD in .env.local and restart the server." };
  }
  const password = String(formData.get("password") ?? "");
  if (password !== expected) return { error: "That password is not correct." };

  const token = dashboardSessionValue();
  if (!token) return { error: "Set DASHBOARD_PASSWORD in .env.local and restart the server." };

  const jar = await cookies();
  jar.set(DASHBOARD_COOKIE, token, cookieOptions());
  refreshDashboard();
  return null;
}

export async function logoutDashboard() {
  const jar = await cookies();
  jar.set(DASHBOARD_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  refreshDashboard();
}

export async function createGuest(
  _prev: CreateState,
  formData: FormData,
): Promise<CreateState> {
  if (!(await isDashboardAuthed())) return { error: "Sign in again to add guests." };

  const title = String(formData.get("title") ?? "");
  const name = cleanName(String(formData.get("name") ?? ""));
  if (!isTitle(title)) return { error: "Choose Mr, Mrs, Miss, Ms, or Dr." };
  if (name.length < 2) return { error: "Enter the guest’s full name." };
  if (name.length > 80) return { error: "That name is too long." };

  try {
    const guest = await insertGuest(title, name);
    refreshDashboard();
    return { ok: true, displayName: guest.displayName, code: guest.code };
  } catch (error) {
    return { error: databaseErrorMessage(error) };
  }
}

export async function deleteGuest(id: string): Promise<DeleteState> {
  if (!(await isDashboardAuthed())) return { error: "Sign in again to remove guests." };
  try {
    const removed = await removeGuest(id);
    if (!removed) return { error: "That invitation is already gone." };
    refreshDashboard();
    return null;
  } catch (error) {
    return { error: databaseErrorMessage(error) };
  }
}

export async function submitRsvp(
  code: string,
  _prev: RsvpState,
  formData: FormData,
): Promise<RsvpState> {
  if (!/^[A-Za-z0-9_-]{8,24}$/.test(code)) {
    return { error: "This invitation link is not valid." };
  }

  const status = String(formData.get("status") ?? "");
  if (status !== "yes" && status !== "no") {
    return { error: "Let us know if you can attend." };
  }

  const companions =
    status === "yes" ? clampCompanions(Number(formData.get("companions"))) : 0;

  try {
    const saved = await saveRsvp(code, status, companions);
    if (!saved) return { error: "This invitation could not be found." };
    refreshDashboard();
    revalidatePath(`/invite/${code}`);
    return { ok: true };
  } catch (error) {
    return { error: databaseErrorMessage(error) };
  }
}
