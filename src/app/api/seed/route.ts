import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

// since this is a seed I'll leave this alone
// This would be refactored and expanded should the need arise to add advocates using the UI
export async function POST() {
  const records = await db.insert(advocates).values(advocateData).returning();

  return Response.json({ advocates: records });
}
