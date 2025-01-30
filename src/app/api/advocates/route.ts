import db from "../../../db";
import { count } from "drizzle-orm";
import { advocates } from "../../../db/schema";

export async function GET(req: Request) {
  try {
    if (!db) {
      return new Response(
          JSON.stringify({ error: "Database connection failed" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "3", 10);

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return new Response(
          JSON.stringify({ error: "Invalid page or limit parameter" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const offset = (page - 1) * limit;

    // Fetch paginated data
    const data = await db.select().from(advocates).limit(limit).offset(offset);

    // Fetch total count for pagination metadata
    const [result] = await db.select({ count: count() }).from(advocates);
    const totalCount = Number(result.count);

    return new Response(
        JSON.stringify({
          data,
          pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching advocates:", error);
    return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
