import 'dotenv/config'
import { startWorkers } from './bull/workers'

console.log('[Worker] Starting BullMQ workers...')
startWorkers()
