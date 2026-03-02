import { auth } from '@/lib/auth'
import { RAZORPAY_PLAN_ID } from '@/lib/plans'
import db from '@/lib/prisma'
import { razorpay, verifyPaymentSignature } from '@/lib/razorpay'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

interface RazorpaySubscriptionResponse {
  id: string
  customer_id?: string
}

const subscription = new Hono()

const getAuthUser = async (c: { req: { raw: { headers: Headers } } }) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) {
    throw new HTTPException(401, { message: 'You are not authenticated, please login' })
  }
  return session.user
}

const getOrgAndSubscription = async (userId: string) => {
  const userWithOrg = await db.user.findUnique({
    where: { id: userId },
    include: {
      organizationsOwned: {
        include: { subscription: true },
        take: 1,
      },
    },
  })
  if (!userWithOrg?.organizationsOwned[0]?.subscription) {
    throw new HTTPException(404, { message: 'Subscription not found' })
  }
  return {
    organization: userWithOrg.organizationsOwned[0],
    subscription: userWithOrg.organizationsOwned[0].subscription,
  }
}

// POST /subscription/create-order
subscription.post('/create-order', async c => {
  const currentUser = await getAuthUser(c)
  const { subscription: sub } = await getOrgAndSubscription(currentUser.id)

  if (sub.plan === 'PRO') {
    throw new HTTPException(400, { message: 'Already on PRO plan' })
  }

  const razorpaySubscription = (await razorpay.subscriptions.create({
    plan_id: RAZORPAY_PLAN_ID,
    total_count: 120,
    customer_notify: 1,
  })) as RazorpaySubscriptionResponse

  await db.subscription.update({
    where: { id: sub.id },
    data: {
      razorpaySubscriptionId: razorpaySubscription.id,
      razorpayCustomerId: razorpaySubscription.customer_id || null,
    },
  })

  return c.json({
    subscriptionId: razorpaySubscription.id,
    keyId: process.env.RAZORPAY_KEY_ID,
  })
})

// POST /subscription/verify
subscription.post('/verify', async c => {
  const currentUser = await getAuthUser(c)
  const body = await c.req.json<{
    razorpay_payment_id: string
    razorpay_subscription_id: string
    razorpay_signature: string
  }>()

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = body

  const isValid = verifyPaymentSignature(
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature
  )
  if (!isValid) {
    throw new HTTPException(400, { message: 'Invalid payment signature' })
  }

  const { subscription: sub } = await getOrgAndSubscription(currentUser.id)

  await db.subscription.update({
    where: { id: sub.id },
    data: {
      plan: 'PRO',
      status: 'ACTIVE',
    },
  })

  return c.json({ success: true })
})

// POST /subscription/cancel
subscription.post('/cancel', async c => {
  const currentUser = await getAuthUser(c)
  const { subscription: sub } = await getOrgAndSubscription(currentUser.id)

  if (sub.plan !== 'PRO' || !sub.razorpaySubscriptionId) {
    throw new HTTPException(400, { message: 'No active PRO subscription to cancel' })
  }

  await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId, true)

  await db.subscription.update({
    where: { id: sub.id },
    data: { cancelAtPeriodEnd: true },
  })

  return c.json({ success: true })
})

// GET /subscription/invoices
subscription.get('/invoices', async c => {
  const currentUser = await getAuthUser(c)
  const { subscription: sub } = await getOrgAndSubscription(currentUser.id)

  const invoices = await db.invoice.findMany({
    where: { subscriptionId: sub.id },
    orderBy: { createdAt: 'desc' },
  })

  return c.json(invoices)
})

export default subscription
