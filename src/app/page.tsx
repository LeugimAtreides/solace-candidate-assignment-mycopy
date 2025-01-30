// app/page.tsx
import React from "react";
import ClientAdvocates from "./client-components/ClientAdvocates";

/**
 * A server component that fetches the first page of advocates
 * from our Next.js API route on the server side. We then pass
 * that data to a client component for pagination & UI.
 */
export default async function HomePage() {
  // 1. Fetch the first page (page=1, limit=5 or 10, etc.)
  const page = 1;
  const limit = 5;

  const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/advocates?page=${page}&limit=${limit}`,
      {
        // If we need fresh data on every request, we can use:
        // cache: "no-store"
      }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch advocates");
  }

  // 2. Parse the JSON
  const json = await res.json();

  // 3. Extract data & pagination info
  const advocates = json.data || [];
  const { totalCount, totalPages, currentPage } = json.pagination || {};

  return (
      <ClientAdvocates
          initialData={advocates}
          initialPage={currentPage || 1}
          totalPages={totalPages || 1}
          limit={limit}
      />
  );
}
