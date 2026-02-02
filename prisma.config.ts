import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/prisma/schema.prisma",
  migrations: {
    path: "src/prisma/migrations",
  },
  datasource: {
    url: "postgresql://neondb_owner:npg_7vdaE0nwoSjP@ep-billowing-credit-aba8bkbt-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require",
  },
});
