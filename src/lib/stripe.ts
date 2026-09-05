import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY

export const stripe = secretKey
  ? new Stripe(secretKey, { apiVersion: '2026-08-26.dahlia' })
  : null

export const PRO_PLAN = {
  id: 'hectron-pro',
  name: 'Pro HECTRON',
  description: 'Memoria persistente, telemetría en Neon y controles avanzados del universo.',
  priceInCents: 999,
  currency: 'eur',
  interval: 'month' as const,
}

export function requireStripe(): Stripe {
  if (!stripe) throw new Error('Stripe no está configurado. Añade STRIPE_SECRET_KEY.')
  return stripe
}

export function isActiveSubscription(status: Stripe.Subscription.Status | undefined) {
  return status === 'active' || status === 'trialing'
}
