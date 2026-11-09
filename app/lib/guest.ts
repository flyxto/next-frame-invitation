export const TITLES = ["Mr", "Mrs", "Miss", "Ms", "Dr"] as const;

export type Title = (typeof TITLES)[number];
export type RsvpStatus = "pending" | "yes" | "no";

export type GuestView = {
  id: string;
  title: Title;
  name: string;
  displayName: string;
  code: string;
  status: RsvpStatus;
  /** People attending in addition to the invited guest. */
  companions: number;
  createdAt: string;
  createdLabel: string;
  respondedAt: string | null;
  respondedLabel: string | null;
};

export type InviteGuest = Pick<
  GuestView,
  "code" | "displayName" | "status" | "companions"
>;

const WHEN = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Colombo",
});

export function isTitle(value: string): value is Title {
  return (TITLES as readonly string[]).includes(value);
}

export function cleanName(input: string) {
  return input.normalize("NFKC").replace(/\s+/g, " ").trim();
}

export function formatGuest(title: Title, name: string) {
  const label = title === "Miss" ? "Miss" : `${title}.`;
  return `${label} ${name}`;
}

export function formatWhen(date: Date) {
  return WHEN.format(date);
}

export function peopleCount(status: RsvpStatus, companions: number) {
  if (status !== "yes") return 0;
  return 1 + companions;
}

export function attendanceLabel(status: RsvpStatus, companions: number) {
  if (status === "pending") return "Waiting for a reply";
  if (status === "no") return "Cannot attend";
  if (companions <= 0) return "Attending alone · 1 person";
  const extra = companions === 1 ? "1 guest with them" : `${companions} guests with them`;
  const total = 1 + companions;
  return `Attending · ${extra} · ${total} people`;
}

export function clampCompanions(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(15, Math.max(0, Math.trunc(value)));
}
