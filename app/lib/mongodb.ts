import { MongoClient, type Db } from "mongodb";

type GlobalMongo = {
  mongoClientPromise?: Promise<MongoClient>;
  mongoIndexes?: Promise<void>;
};

const globalMongo = globalThis as typeof globalThis & GlobalMongo;

export function databaseErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("MONGODB_URI is not set")) {
    return "Add MONGODB_URI to .env.local, then restart the server.";
  }
  return "Could not reach MongoDB. Check MONGODB_URI and that the database is running.";
}

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  if (!globalMongo.mongoClientPromise) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 4000 });
    globalMongo.mongoClientPromise = client.connect().catch((error: unknown) => {
      globalMongo.mongoClientPromise = undefined;
      throw error;
    });
  }

  const client = await globalMongo.mongoClientPromise;
  const db = client.db(process.env.MONGODB_DB || "nextframe");

  if (!globalMongo.mongoIndexes) {
    globalMongo.mongoIndexes = db
      .collection("guests")
      .createIndex({ code: 1 }, { unique: true })
      .then(() => undefined)
      .catch((error: unknown) => {
        globalMongo.mongoIndexes = undefined;
        throw error;
      });
  }

  await globalMongo.mongoIndexes;
  return db;
}
