import db from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

const webhooks = new Hono()

webhooks.post('/razorpay', async c => {
  const signature = c.req.header('X-Razorpay-Signature')
  if (!signature) {
    throw new HTTPException(400, { message: 'Missing signature' })
  }

  const rawBody = await c.req.text()
  console.log('rawBody', rawBody)
  const isValid = verifyWebhookSignature(rawBody, signature)
  if (!isValid) {
    throw new HTTPException(400, { message: 'Invalid webhook signature' })
  }

  const event = JSON.parse(rawBody)
  const eventType: string = event.event
  const payload = event.payload

  switch (eventType) {
    case 'subscription.charged': {
      const rzpSub = payload.subscription?.entity
      const payment = payload.payment?.entity
      if (!rzpSub?.id || !payment?.id) break

      const sub = await db.subscription.findUnique({
        where: { razorpaySubscriptionId: rzpSub.id },
      })
      if (!sub) break

      // Extract payment method details
      const method: string | undefined = payment.method
      const cardLast4: string | undefined = payment.card?.last4
      const cardNetwork: string | undefined = payment.card?.network
      const cardIssuer: string | undefined = payment.card?.issuer
      const cardSubType: string | undefined = payment.card?.sub_type
      const cardInternational: boolean | undefined = payment.card?.international
      const upiVpa: string | undefined = payment.vpa
      const bankCode: string | undefined = payment.bank
      const wallet: string | undefined = payment.wallet
      const fee: number | undefined = payment.fee
      const tax: number | undefined = payment.tax
      const acquirerData = payment.acquirer_data ?? null
      const razorpayOrderId: string | undefined = payment.order_id
      const razorpayInvoiceId: string | undefined = payment.invoice_id
      const description: string | undefined = payment.description

      // Subscription billing cycle fields
      const chargeAt = rzpSub.charge_at ? new Date(rzpSub.charge_at * 1000) : undefined
      const paidCount: number | undefined = rzpSub.paid_count
      const remainingCount: number | undefined = rzpSub.remaining_count

      await db.subscription.update({
        where: { id: sub.id },
        data: {
          razorpayCustomerId: payment.customer_id || null,
          currentPeriodStart: rzpSub.current_start
            ? new Date(rzpSub.current_start * 1000)
            : undefined,
          currentPeriodEnd: rzpSub.current_end ? new Date(rzpSub.current_end * 1000) : undefined,
          paymentMethodLast4: cardLast4 ?? upiVpa ?? null,
          paymentMethodType: method ?? null,
          paymentMethodBrand: cardNetwork ?? null,
          chargeAt,
          paidCount,
          remainingCount,
        },
      })

      const paidAt = payment.captured_at ? new Date(payment.captured_at * 1000) : new Date()
      const invoicePayload = {
        subscriptionId: sub.id,
        razorpayPaymentId: payment.id,
        razorpayOrderId: razorpayOrderId ?? null,
        razorpayInvoiceId: razorpayInvoiceId ?? null,
        amount: payment.amount,
        currency: payment.currency || 'INR',
        status: 'paid',
        method: method ?? null,
        cardLast4: cardLast4 ?? null,
        cardNetwork: cardNetwork ?? null,
        cardIssuer: cardIssuer ?? null,
        cardSubType: cardSubType ?? null,
        cardInternational: cardInternational ?? null,
        upiVpa: upiVpa ?? null,
        bankCode: bankCode ?? null,
        wallet: wallet ?? null,
        fee: fee ?? null,
        tax: tax ?? null,
        acquirerData,
        description: description ?? null,
        paidAt,
      }

      await db.invoice.upsert({
        where: { razorpayPaymentId: payment.id },
        create: invoicePayload,
        update: {
          status: 'paid',
          method: method ?? null,
          cardLast4: cardLast4 ?? null,
          cardNetwork: cardNetwork ?? null,
          cardIssuer: cardIssuer ?? null,
          cardSubType: cardSubType ?? null,
          cardInternational: cardInternational ?? null,
          upiVpa: upiVpa ?? null,
          bankCode: bankCode ?? null,
          wallet: wallet ?? null,
          fee: fee ?? null,
          tax: tax ?? null,
          acquirerData,
          paidAt,
        },
      })
      break
    }

    case 'subscription.activated': {
      const rzpSub = payload.subscription?.entity
      if (!rzpSub?.id) break
      await db.subscription.updateMany({
        where: { razorpaySubscriptionId: rzpSub.id },
        data: { status: 'ACTIVE', plan: 'PRO' },
      })
      break
    }

    case 'subscription.cancelled':
    case 'subscription.completed': {
      const rzpSub = payload.subscription?.entity
      if (!rzpSub?.id) break
      await db.subscription.updateMany({
        where: { razorpaySubscriptionId: rzpSub.id },
        data: { status: 'CANCELED', plan: 'FREE', cancelAtPeriodEnd: false },
      })
      break
    }

    case 'subscription.halted':
    case 'subscription.pending': {
      const rzpSub = payload.subscription?.entity
      if (!rzpSub?.id) break
      await db.subscription.updateMany({
        where: { razorpaySubscriptionId: rzpSub.id },
        data: { status: 'PAST_DUE' },
      })
      break
    }

    case 'payment.failed': {
      const payment = payload.payment?.entity
      if (!payment?.subscription_id) break
      await db.subscription.updateMany({
        where: { razorpaySubscriptionId: payment.subscription_id },
        data: { status: 'PAST_DUE' },
      })

      const sub = await db.subscription.findUnique({
        where: { razorpaySubscriptionId: payment.subscription_id },
      })
      if (sub && payment.id) {
        const errorCode: string | undefined = payment.error_code
        const errorDescription: string | undefined = payment.error_description
        const method: string | undefined = payment.method
        const acquirerData = payment.acquirer_data ?? null

        await db.invoice.upsert({
          where: { razorpayPaymentId: payment.id },
          create: {
            subscriptionId: sub.id,
            razorpayPaymentId: payment.id,
            razorpayOrderId: payment.order_id ?? null,
            amount: payment.amount || 0,
            currency: payment.currency || 'INR',
            status: 'failed',
            method: method ?? null,
            errorCode: errorCode ?? null,
            errorDescription: errorDescription ?? null,
            acquirerData,
          },
          update: {
            status: 'failed',
            method: method ?? null,
            errorCode: errorCode ?? null,
            errorDescription: errorDescription ?? null,
            acquirerData,
          },
        })
      }
      break
    }

    default:
      break
  }

  return c.json({ received: true })
})

export default webhooks
