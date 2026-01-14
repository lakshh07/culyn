import { Hono } from 'hono'
import admin from './admin'
import apiKeys from './api-keys'
import cookbook from './cookbook'
import ingredients from './ingredients'
import jobs from './jobs'
import lists from './lists'
import recipes from './recipes'
import tags from './tags'
import user from './user'

const v1 = new Hono()

// Health check endpoint
v1.get('/health', c => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Mount routes
v1.route('/tags', tags)
v1.route('/ingredients', ingredients)
v1.route('/cookbook', cookbook)
v1.route('/user', user)
v1.route('/recipes', recipes)
v1.route('/lists', lists)
v1.route('/jobs', jobs)
v1.route('/admin', admin)
v1.route('/api-keys', apiKeys)

export default v1
