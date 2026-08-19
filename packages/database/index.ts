import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";

// Plain TCP driver adapter: works against any Postgres (self-hosted, Neon, Supabase).
const adapter = new PrismaPg({ connectionString: `${process.env.DATABASE_URL}` });

const prisma = new PrismaClient({ adapter });

export { prisma };
