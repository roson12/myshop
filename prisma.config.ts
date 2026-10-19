import "dotenv/config";
import { defineConfig } from "prisma/config";

const fallbackUrl = "postgresql://pastel:pastel@localhost:5432/pastel_shop?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? fallbackUrl,
  },
});
