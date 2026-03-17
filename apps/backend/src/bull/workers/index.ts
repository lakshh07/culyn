import { startContentImportWorker, stopContentImportWorker } from './content-import-worker'
import { startInstagramScrapeWorker, stopInstagramScrapeWorker } from './instagram-scrape-worker'

export function startWorkers() {
  console.log('[Workers] Starting instagram scrape worker...')
  startInstagramScrapeWorker()
  console.log('[Workers] Starting content import worker...')
  startContentImportWorker()
  console.log('[Workers] All workers started.')
}

export function stopWorkers() {
  console.log('[Workers] Stopping workers...')
  return Promise.all([stopInstagramScrapeWorker(), stopContentImportWorker()])
}
