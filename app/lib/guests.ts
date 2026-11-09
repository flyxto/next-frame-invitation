import { randomBytes } from "node:crypto";
import { ObjectId, type Collection, type WithId } from "mongodb";
import {
  type GuestView,
  type RsvpStatus,
  type Title,
  formatGuest,
  formatWhen,
} from "./guest";
import { getDb } from "./mongodb";

type GuestDoc = {
  title: Title;
  name: string;
  code: string;
  status: RsvpStatus;
  companions: number;
  createdAt: Date;
  respondedAt: Date | null;
};

function toView(doc: WithId<GuestDoc>): GuestView {
  return {
    id: doc._id.toHexString(),
    title: doc.title,
    name: doc.name,
    displayName: formatGuest(doc.title, doc.name),
    code: doc.code,
    status: doc.status,
    companions: doc.companions,
    createdAt: doc.createdAt.toISOString(),
    createdLabel: formatWhen(doc.createdAt),
    respondedAt: doc.respondedAt ? doc.respondedAt.toISOString() : null,
    respondedLabel: doc.respondedAt ? formatWhen(doc.respondedAt) : null,
  };
}

async function guests(): Promise<Collection<GuestDoc>> {
  const db = await getDb();
  return db.collection<GuestDoc>("guests");
}

function newCode() {
  return randomBytes(8).toString("base64url");
}

export async function listGuests(): Promise<GuestView[]> {
  const collection = await guests();
  const docs = await collection.find({}).sort({ createdAt: -1 }).toArray();
  return docs.map(toView);
}

export async function findGuestByCode(code: string): Promise<GuestView | null> {
  const collection = await guests();
  const doc = await collection.findOne({ code });
  return doc ? toView(doc) : null;
}

export async function createGuest(title: Title, name: string): Promise<GuestView> {
  const collection = await guests();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const doc = {
      title,
      name,
      code: newCode(),
      status: "pending" as const,
      companions: 0,
      createdAt: new Date(),
      respondedAt: null,
    };
    try {
      const result = await collection.insertOne(doc);
      return toView({ ...doc, _id: result.insertedId });
    } catch (error) {
      const duplicate =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: number }).code === 11000;
      if (!duplicate || attempt === 3) throw error;
    }
  }
  throw new Error("Could not create a guest link");
}

export async function saveRsvp(
  code: string,
  status: Exclude<RsvpStatus, "pending">,
  companions: number,
): Promise<GuestView | null> {
  const collection = await guests();
  const doc = await collection.findOneAndUpdate(
    { code },
    { $set: { status, companions, respondedAt: new Date() } },
    { returnDocument: "after" },
  );
  return doc ? toView(doc) : null;
}

export async function deleteGuest(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await guests();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
