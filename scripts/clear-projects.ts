/**
 * Deletes all projects from the database. Cascades to milestones, tasks, tokens, and activity logs.
 * Run from project root: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/clear-projects.ts
 * Or: npx tsx scripts/clear-projects.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const deleted = await prisma.project.deleteMany({})
  console.log(`Deleted ${deleted.count} project(s). Related milestones, tasks, tokens, and activity logs were removed.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
