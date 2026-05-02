import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

/** TLS for `pg` Pool — local Postgres often has no SSL; hosted DBs need it. */
function pgSslOption(): undefined | { rejectUnauthorized: boolean } {
  const flag = process.env.DATABASE_SSL
  const url = process.env.DATABASE_URL ?? ''

  if (flag === 'false') return undefined
  if (flag === 'true') return { rejectUnauthorized: false }

  if (/sslmode=disable/i.test(url)) return undefined
  if (/sslmode=(require|no-verify)/i.test(url)) return { rejectUnauthorized: false }

  if (process.env.NODE_ENV === 'production') return { rejectUnauthorized: false }

  return undefined
}

const ssl = pgSslOption()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(ssl ? { ssl } : {}),
})

const adapter = new PrismaPg(pool)

const db = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export default db
