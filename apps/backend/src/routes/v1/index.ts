import { Hono } from 'hono'
import admin from './admin'
import apiKeys from './api-keys'
import chat from './chat'
import content from './content'
import cookbook from './cookbook'
import ingredients from './ingredients'
import jobs from './jobs'
import library from './library'
import lists from './lists'
import places from './places'
import products from './products'
import recipes from './recipes'
import subscription from './subscription'
import tags from './tags'
import user from './user'
import webhooks from './webhooks'

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
v1.route('/places', places)
v1.route('/products', products)
v1.route('/library', library)
v1.route('/content', content)
v1.route('/chat', chat)
v1.route('/lists', lists)
v1.route('/jobs', jobs)
v1.route('/admin', admin)
v1.route('/api-keys', apiKeys)
v1.route('/subscription', subscription)
v1.route('/webhooks', webhooks)

export default v1
