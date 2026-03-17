#!/usr/bin/env bun
/**
 * Test Instagram scrapers directly.
 *
 * Usage:
 *   bun run scripts/test-apify.ts <instagram_url> [provider]
 *
 * provider: "apify" | "graphql" | "auto" (default: "auto")
 *
 * Examples:
 *   bun run scripts/test-apify.ts https://www.instagram.com/reel/ABC123/
 *   bun run scripts/test-apify.ts https://www.instagram.com/reel/ABC123/ apify
 *   bun run scripts/test-apify.ts https://www.instagram.com/reel/ABC123/ graphql
 *
 * Required env vars (set in .env or inline):
 *   APIFY_API_KEY     — needed for "apify" and "auto" providers
 *   X_IG_APP_ID       — needed for "graphql" and "auto" providers
 *   REDIS_URL         — needed for "graphql" and "auto" providers (lsd token cache)
 *   IG_SESSION_COOKIE — optional, improves graphql success rate
 *   IG_DOC_ID         — optional, overrides default doc_id
 */

import { scrapeViaApify } from '@/lib/source-scrapers/instagram/providers/apify'
import { scrapeViaGraphQL } from '@/lib/source-scrapers/instagram/providers/graphql'
import { extractPostId, getInstagramPostData } from '@/lib/source-scrapers/instagram/scraper'
import type { ScrapedData } from '@/lib/source-scrapers/types'

const url = process.argv[2]
const provider = (process.argv[3] ?? 'auto') as 'apify' | 'graphql' | 'auto'

if (!url) {
  console.error('Usage: bun run scripts/test-apify.ts <instagram_url> [apify|graphql|auto]')
  process.exit(1)
}

function printResult(result: ScrapedData) {
  console.log('\nResult:')
  console.log(JSON.stringify(result, null, 2))
  console.log('\nField check:')
  console.log(`  caption:       ${result.caption ? '✓' : '✗ (empty)'}`)
  console.log(`  displayUrl:    ${result.displayUrl ? '✓' : '✗ (missing)'}`)
  console.log(`  ownerUsername: ${result.ownerUsername ? '✓' : '✗ (empty)'}`)
  console.log(`  videoUrl:      ${result.videoUrl ? '✓ (video)' : '— (not a video)'}`)
}

console.log(`URL:      ${url}`)
console.log(`Provider: ${provider}\n`)

try {
  let result: ScrapedData

  if (provider === 'apify') {
    if (!process.env.APIFY_API_KEY) {
      console.error('Error: APIFY_API_KEY env var is not set')
      process.exit(1)
    }
    result = await scrapeViaApify(url)
  } else if (provider === 'graphql') {
    if (!process.env.X_IG_APP_ID) {
      console.error('Error: X_IG_APP_ID env var is not set')
      process.exit(1)
    }
    const postId = extractPostId(url)
    if (!postId) {
      console.error('Error: could not extract post ID from URL')
      process.exit(1)
    }
    console.log(`Post ID: ${postId}`)
    result = await scrapeViaGraphQL(postId)
  } else {
    // "auto" — uses the real scraper.ts logic (graphql → apify fallback)
    // Override provider via env so scraper.ts respects it
    process.env.IG_SCRAPER_PROVIDER = process.env.IG_SCRAPER_PROVIDER ?? 'internal'
    result = await getInstagramPostData(url)
  }

  printResult(result)
} catch (err) {
  console.error('Scrape failed:', err instanceof Error ? err.message : err)
  process.exit(1)
}
