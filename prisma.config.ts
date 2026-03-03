import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Prisma config runs outside Next.js, so we load .env manually
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: false });

export default defineConfig({
  schema: "src/prisma/schema.prisma",
  migrations: {
    path: "src/prisma/migrations",
    seed: "bun ./src/prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
