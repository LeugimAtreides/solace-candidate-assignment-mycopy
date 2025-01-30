import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Singleton instance to prevent multiple connections
let dbInstance: ReturnType<typeof drizzle>;

const setup = () => {
  // According to drizzle docs its not good to simulate the behavior of drizzle in error instances
  // it is preferred that an error is thrown
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  try {
    if (!dbInstance) {
      console.log("Connecting to database...");

      const queryClient = postgres(process.env.DATABASE_URL, {
        max: parseInt(process.env.DB_POOL_SIZE || "10", 10), // Use connection pooling
        ssl: process.env.NODE_ENV === "production", // Enforce SSL in production
      });

      dbInstance = drizzle(queryClient);
      console.log("Database connected successfully");
    }

    return dbInstance;
  } catch (error) {
    throw new Error(`Database connection error: ${error}`);
  }
};

const db = setup();
export default db;
