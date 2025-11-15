#!/usr/bin/env bun

/**
 * CLI tool to check AI usage costs for users
 *
 * Usage:
 *   bunx tsx src/cli/check-ai-costs.ts <user_id> [period]
 *   bunx tsx src/cli/check-ai-costs.ts --top [limit] [period]
 *
 * Examples:
 *   bunx tsx src/cli/check-ai-costs.ts user_123
 *   bunx tsx src/cli/check-ai-costs.ts user_123 month
 *   bunx tsx src/cli/check-ai-costs.ts --top 10 month
 */

import { getUserCostSummary, getTopUsersByCost } from '@/lib/ai/usage'
import type { CostAggregationPeriod, UserCostSummary } from '@/lib/ai/types'
import 'dotenv/config'

function printSummary(summary: UserCostSummary) {
  console.log('\n' + '='.repeat(80))
  console.log(`User ID: ${summary.userId}`)
  console.log('='.repeat(80))
  console.log(`Total Cost: $${summary.totalCost}`)
  console.log(`Total Requests: ${summary.totalRequests}`)
  console.log(`Total Input Tokens: ${summary.inputTokens.toLocaleString()}`)
  console.log(`Total Output Tokens: ${summary.outputTokens.toLocaleString()}`)
  console.log('\nBreakdown by Provider:')

  for (const [provider, data] of Object.entries(summary.byProvider)) {
    console.log(`\n  ${provider.toUpperCase()}`)
    console.log(`  ${'─'.repeat(76)}`)
    console.log(`  Cost: $${data.cost}`)
    console.log(`  Requests: ${data.requests}`)
    console.log(`  Input Tokens: ${data.inputTokens.toLocaleString()}`)
    console.log(`  Output Tokens: ${data.outputTokens.toLocaleString()}`)

    console.log('\n  Models:')
    for (const [model, modelData] of Object.entries(data.byModel)) {
      console.log(`    • ${model}:`)
      console.log(`      Cost: $${modelData.cost}`)
      console.log(`      Requests: ${modelData.requests}`)
    }
  }

  console.log('\n' + '='.repeat(80) + '\n')
}

function printTopUsers(summaries: UserCostSummary[]) {
  console.log('\n' + '='.repeat(80))
  console.log('Top Users by Cost')
  console.log('='.repeat(80))
  console.log(
    '\n' +
      'Rank'.padEnd(6) +
      'User ID'.padEnd(30) +
      'Cost'.padEnd(15) +
      'Requests'.padEnd(12) +
      'Tokens (In/Out)'
  )
  console.log('─'.repeat(80))

  summaries.forEach((summary, index) => {
    const rank = `${index + 1}.`
    const userId = summary.userId.length > 28 ? summary.userId.slice(0, 25) + '...' : summary.userId
    const cost = `$${summary.totalCost}`
    const requests = summary.totalRequests.toString()
    const tokens = `${summary.inputTokens.toLocaleString()}/${summary.outputTokens.toLocaleString()}`

    console.log(
      `${rank.padEnd(6)}${userId.padEnd(30)}${cost.padEnd(15)}${requests.padEnd(12)}${tokens}`
    )
  })

  console.log('\n' + '='.repeat(80) + '\n')
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
AI Cost Checker CLI

Usage:
  npx tsx src/cli/check-ai-costs.ts <user_id> [period]
  npx tsx src/cli/check-ai-costs.ts --top [limit] [period]

Arguments:
  user_id       The user ID to check costs for
  period        Time period: day, week, month, year, all (default: all)
  --top         Show top users by cost
  limit         Number of top users to show (default: 10)

Examples:
  npx tsx src/cli/check-ai-costs.ts user_abc123
  npx tsx src/cli/check-ai-costs.ts user_abc123 month
  npx tsx src/cli/check-ai-costs.ts --top 10 month
  npx tsx src/cli/check-ai-costs.ts --top 20 week
`)
    process.exit(0)
  }

  try {
    if (args[0] === '--top') {
      // Show top users
      const limit = args[1] && !isNaN(Number(args[1])) ? Number(args[1]) : 10
      const period = (args[2] || 'all') as CostAggregationPeriod

      console.log(`\nFetching top ${limit} users by cost (period: ${period})...`)
      const topUsers = await getTopUsersByCost(limit, period)

      if (topUsers.length === 0) {
        console.log('\nNo usage data found.')
        process.exit(0)
      }

      printTopUsers(topUsers)
    } else {
      // Show specific user
      const userId = args[0]
      const period = (args[1] || 'all') as CostAggregationPeriod

      console.log(`\nFetching cost summary for user: ${userId} (period: ${period})...`)
      const summary = await getUserCostSummary(userId, period)

      if (summary.totalRequests === 0) {
        console.log(`\nNo usage data found for user ${userId} in the specified period.`)
        process.exit(0)
      }

      printSummary(summary)
    }
  } catch (error) {
    console.error('\nError:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
