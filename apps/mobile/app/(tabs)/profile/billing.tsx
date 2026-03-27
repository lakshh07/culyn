import { SettingsSection } from '@/components/settings/SettingsSection'
import { useThemeColors } from '@/constants/useTheme'
import { apiClient } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import RazorpayCheckout from 'react-native-razorpay'
import { SafeAreaView } from 'react-native-safe-area-context'

interface BillingInfo {
  subscription: {
    plan: 'FREE' | 'PRO'
    status: string
    currentPeriodEnd?: string | null
    chargeAt?: string | null
    paidCount?: number | null
    daysLeft?: number | null
    cancelAtPeriodEnd?: boolean
    paymentMethod?: {
      last4: string
      type: string
      brand: string | null
    } | null
    maxRecipes: number
    maxLists: number
    aiCreditsLimit: number
  }
  usage: { recipeCount: number; userCount: number; listCount: number }
}

interface Invoice {
  id: string
  amount: number
  currency: string
  status: string
  method?: string | null
  cardLast4?: string | null
  cardNetwork?: string | null
  upiVpa?: string | null
  bankCode?: string | null
  wallet?: string | null
  fee?: number | null
  errorDescription?: string | null
  paidAt?: string | null
  createdAt: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatAmount(paise: number, currency: string): string {
  const amount = paise / 100
  if (currency === 'INR') return `₹${amount.toFixed(0)}`
  return `${currency} ${amount.toFixed(2)}`
}

function methodBadge(inv: Invoice): string {
  if (inv.method === 'card') {
    if (inv.cardLast4) return `\u{1F4B3} \u2022\u2022\u2022\u2022 ${inv.cardLast4}`
    if (inv.cardNetwork) return `\u{1F4B3} ${inv.cardNetwork}`
    return '\u{1F4B3} Card'
  }
  if (inv.method === 'upi') return `\u26A1 ${inv.upiVpa ?? 'UPI'}`
  if (inv.method === 'netbanking') return `\u{1F3E6} ${inv.bankCode ?? 'Netbanking'}`
  if (inv.method === 'wallet') return `\u{1F45B} ${inv.wallet ?? 'Wallet'}`
  return ''
}

function LimitText({ value }: { value: number }) {
  const colors = useThemeColors()
  return (
    <Text
      style={[
        styles.usageValue,
        { color: colors.textSecondary, fontFamily: 'Poppins_400Regular' },
      ]}>
      {value === -1 ? 'Unlimited' : value}
    </Text>
  )
}

export default function BillingScreen() {
  const colors = useThemeColors()
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()
  const [upgrading, setUpgrading] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const { data: billingInfo, isLoading } = useQuery({
    queryKey: ['billing'],
    queryFn: async () => {
      const response = await apiClient().get<BillingInfo>('/user/billing')
      return response.data
    },
  })

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await apiClient().get<Invoice[]>('/subscription/invoices')
      return response.data
    },
    enabled: billingInfo?.subscription.plan === 'PRO',
  })

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const orderRes = await apiClient().post<{
        subscriptionId: string
        keyId: string
      }>('/subscription/create-order')
      const { subscriptionId, keyId } = orderRes.data

      const options = {
        key: keyId,
        subscription_id: subscriptionId,
        name: 'Culyn',
        description: 'Pro Plan — ₹49/month',
        prefill: {
          email: session?.user?.email ?? '',
          name: session?.user?.name ?? '',
        },
        theme: { color: colors.primary },
      }

      const payment = (await RazorpayCheckout.open(options as any)) as unknown as {
        razorpay_payment_id: string
        razorpay_subscription_id: string
        razorpay_signature: string
      }

      await apiClient().post('/subscription/verify', {
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_subscription_id: payment.razorpay_subscription_id,
        razorpay_signature: payment.razorpay_signature,
      })

      await queryClient.invalidateQueries({ queryKey: ['billing'] })
      await queryClient.invalidateQueries({ queryKey: ['invoices'] })
      Alert.alert('Welcome to Pro!', 'Your subscription is now active.')
    } catch (err: any) {
      if (err?.code !== 'PAYMENT_CANCELLED') {
        Alert.alert('Payment failed', err?.description || 'Something went wrong. Please try again.')
      }
    } finally {
      setUpgrading(false)
    }
  }

  const handleCancel = () => {
    const periodEnd = billingInfo?.subscription.currentPeriodEnd
    const dateStr = periodEnd ? formatDate(periodEnd) : 'end of billing period'

    Alert.alert(
      'Cancel Subscription',
      `Your Pro plan will remain active until ${dateStr}. After that, you'll be moved to the Free plan.`,
      [
        { text: 'Keep Pro', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true)
            try {
              await apiClient().post('/subscription/cancel')
              await queryClient.invalidateQueries({ queryKey: ['billing'] })
              Alert.alert('Subscription Cancelled', `Your plan stays active until ${dateStr}.`)
            } catch {
              Alert.alert('Error', 'Failed to cancel. Please try again.')
            } finally {
              setCancelling(false)
            }
          },
        },
      ]
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  const subscription = billingInfo?.subscription
  const usage = billingInfo?.usage
  const isPro = subscription?.plan === 'PRO'

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Current Plan Card */}
        <View style={styles.planCard}>
          <LinearGradient
            colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.planGradient}>
            <View style={styles.planRow}>
              <Text style={[styles.planLabel, { fontFamily: 'Poppins_500Medium', color: colors.white }]}>
                Current Plan
              </Text>
              {isPro && (
                <View style={styles.proBadge}>
                  <Text style={[styles.proBadgeText, { fontFamily: 'Poppins_500Medium', color: colors.white }]}>
                    ⭐ PRO
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.planName, { fontFamily: 'EBGaramond_700Bold', color: colors.white }]}>
              {isPro ? '₹49' : 'Free'}
            </Text>
            <Text style={[styles.planPrice, { fontFamily: 'Poppins_400Regular', color: colors.white }]}>
              {isPro ? 'per month' : 'Forever free'}
            </Text>

            {isPro && (
              <Text style={[styles.nextBilling, { fontFamily: 'Poppins_400Regular', color: colors.white }]}>
                {subscription?.chargeAt
                  ? `Next billing: ${formatDate(subscription.chargeAt)}`
                  : subscription?.currentPeriodEnd
                    ? `Next billing: ${formatDate(subscription.currentPeriodEnd)}`
                    : 'Billing date will appear after first cycle'}
              </Text>
            )}

            {isPro && subscription?.daysLeft != null && subscription.daysLeft > 0 && (
              <View style={styles.daysLeft}>
                <Text style={[styles.daysLeftText, { fontFamily: 'Poppins_500Medium', color: colors.white }]}>
                  {subscription.cancelAtPeriodEnd
                    ? `Cancels on ${subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : 'period end'}`
                    : `${subscription.daysLeft} days remaining`}
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Upgrade card for FREE users */}
        {!isPro && (
          <View
            style={[
              styles.upgradeCard,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}>
            <Text
              style={[
                styles.upgradeTitle,
                { color: colors.textPrimary, fontFamily: 'EBGaramond_700Bold' },
              ]}>
              ⚡ Upgrade to Pro
            </Text>
            <Text
              style={[
                styles.upgradePrice,
                {
                  color: colors.textSecondary,
                  fontFamily: 'Poppins_400Regular',
                },
              ]}>
              ₹49 / month
            </Text>
            <View style={styles.featureList}>
              {[
                'Unlimited recipes in library',
                'Unlimited AI credits',
                'Unlimited shopping lists',
              ].map(f => (
                <Text
                  key={f}
                  style={[
                    styles.feature,
                    {
                      color: colors.textSecondary,
                      fontFamily: 'Poppins_400Regular',
                    },
                  ]}>
                  ✓ {f}
                </Text>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
              onPress={handleUpgrade}
              disabled={upgrading}>
              {upgrading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={[styles.upgradeButtonText, { fontFamily: 'Poppins_500Medium', color: colors.white }]}>
                  Try Pro — ₹49/month
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Payment Method for PRO */}
        {isPro && (
          <SettingsSection title="Payment Method">
            <View style={[styles.paymentMethod, { backgroundColor: colors.background }]}>
              <Text style={[styles.paymentIcon, { fontFamily: 'Poppins_400Regular' }]}>💳</Text>
              <View style={styles.paymentInfo}>
                {subscription?.paymentMethod ? (
                  <>
                    <Text
                      style={[
                        styles.paymentText,
                        {
                          color: colors.textPrimary,
                          fontFamily: 'Poppins_500Medium',
                        },
                      ]}>
                      {subscription.paymentMethod.type === 'upi'
                        ? `UPI — ${subscription.paymentMethod.last4}`
                        : `•••• ${subscription.paymentMethod.last4}`}
                    </Text>
                    {subscription.paymentMethod.brand && (
                      <Text
                        style={[
                          styles.paymentSub,
                          {
                            color: colors.textSecondary,
                            fontFamily: 'Poppins_400Regular',
                          },
                        ]}>
                        {subscription.paymentMethod.brand}
                      </Text>
                    )}
                  </>
                ) : (
                  <>
                    <Text
                      style={[
                        styles.paymentText,
                        {
                          color: colors.textPrimary,
                          fontFamily: 'Poppins_500Medium',
                        },
                      ]}>
                      Payment method
                    </Text>
                    <Text
                      style={[
                        styles.paymentSub,
                        {
                          color: colors.textSecondary,
                          fontFamily: 'Poppins_400Regular',
                        },
                      ]}>
                      Details will appear after first charge
                    </Text>
                  </>
                )}
              </View>
            </View>
          </SettingsSection>
        )}

        {/* Usage & Limits */}
        <SettingsSection title="Usage & Limits">
          <View style={styles.usageContainer}>
            <View style={styles.usageRow}>
              <Text
                style={[
                  styles.usageLabel,
                  {
                    color: colors.textPrimary,
                    fontFamily: 'Poppins_500Medium',
                  },
                ]}>
                Library Items
              </Text>
              {isPro ? (
                <LimitText value={-1} />
              ) : (
                <Text
                  style={[
                    styles.usageValue,
                    {
                      color: colors.textSecondary,
                      fontFamily: 'Poppins_400Regular',
                    },
                  ]}>
                  {usage?.recipeCount ?? 0} / 12
                </Text>
              )}
            </View>
            {!isPro && (
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(((usage?.recipeCount ?? 0) / 12) * 100, 100)}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
            )}

            <View style={[styles.usageRow, { marginTop: 16 }]}>
              <Text
                style={[
                  styles.usageLabel,
                  {
                    color: colors.textPrimary,
                    fontFamily: 'Poppins_500Medium',
                  },
                ]}>
                Shopping Lists
              </Text>
              {isPro ? (
                <LimitText value={-1} />
              ) : (
                <Text
                  style={[
                    styles.usageValue,
                    {
                      color: colors.textSecondary,
                      fontFamily: 'Poppins_400Regular',
                    },
                  ]}>
                  {usage?.listCount ?? 0} / 5
                </Text>
              )}
            </View>
            {!isPro && (
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(((usage?.listCount ?? 0) / 5) * 100, 100)}%`,
                      backgroundColor: colors.food,
                    },
                  ]}
                />
              </View>
            )}

            <View style={[styles.usageRow, { marginTop: 16 }]}>
              <Text
                style={[
                  styles.usageLabel,
                  {
                    color: colors.textPrimary,
                    fontFamily: 'Poppins_500Medium',
                  },
                ]}>
                AI Credits
              </Text>
              <LimitText value={subscription?.aiCreditsLimit ?? 100} />
            </View>
          </View>
        </SettingsSection>

        {/* Invoices for PRO */}
        {isPro && (
          <SettingsSection title="Invoices">
            <View style={[styles.invoiceList, { backgroundColor: colors.background }]}>
              {invoices && invoices.length > 0 ? (
                invoices.map((inv, i) => (
                  <View
                    key={inv.id}
                    style={[
                      styles.invoiceRow,
                      i < invoices.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: colors.border,
                      },
                    ]}>
                    <View style={styles.invoiceLeft}>
                      <Text
                        style={[
                          styles.invoiceDate,
                          {
                            color: colors.textSecondary,
                            fontFamily: 'Poppins_400Regular',
                          },
                        ]}>
                        {formatDate(inv.paidAt ?? inv.createdAt)}
                      </Text>
                      {methodBadge(inv) ? (
                        <Text
                          style={[
                            styles.invoiceMethod,
                            {
                              color: colors.textSecondary,
                              fontFamily: 'Poppins_400Regular',
                            },
                          ]}>
                          {methodBadge(inv)}
                        </Text>
                      ) : null}
                      {inv.status === 'failed' && inv.errorDescription ? (
                        <Text style={[styles.invoiceError, { fontFamily: 'Poppins_400Regular', color: colors.error }]}>
                          {inv.errorDescription}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.invoiceRight}>
                      <Text
                        style={[
                          styles.invoiceAmount,
                          {
                            color: colors.textPrimary,
                            fontFamily: 'Poppins_500Medium',
                          },
                        ]}>
                        {formatAmount(inv.amount, inv.currency)}
                      </Text>
                      <View
                        style={[
                          styles.invoiceStatus,
                          {
                            backgroundColor: inv.status === 'paid' ? colors.successSoft : colors.errorSoft,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.invoiceStatusText,
                            {
                              color: inv.status === 'paid' ? colors.success : colors.error,
                              fontFamily: 'Poppins_500Medium',
                            },
                          ]}>
                          {inv.status === 'paid' ? 'Paid ✓' : 'Failed'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.invoiceRow}>
                  <Text
                    style={[
                      styles.invoiceDate,
                      {
                        color: colors.textSecondary,
                        fontFamily: 'Poppins_400Regular',
                      },
                    ]}>
                    No invoices yet
                  </Text>
                </View>
              )}
            </View>
          </SettingsSection>
        )}

        {/* Cancel for PRO */}
        {isPro && !subscription?.cancelAtPeriodEnd && (
          <View style={styles.cancelContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.error }]}
              onPress={handleCancel}
              disabled={cancelling}>
              {cancelling ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Text
                  style={[
                    styles.cancelText,
                    { color: colors.error, fontFamily: 'Poppins_500Medium' },
                  ]}>
                  Cancel Subscription
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {isPro && subscription?.cancelAtPeriodEnd && subscription?.currentPeriodEnd && (
          <View
            style={[
              styles.cancelNotice,
              { backgroundColor: colors.errorSoft, borderColor: colors.error },
            ]}>
            <Text
              style={[
                styles.cancelNoticeText,
                { color: colors.error, fontFamily: 'Poppins_400Regular' },
              ]}>
              Your plan stays active until {formatDate(subscription.currentPeriodEnd)}, then reverts
              to Free.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 24, paddingBottom: 48 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  planCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  planGradient: { padding: 24 },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planLabel: { color: '#fff', fontSize: 14, lineHeight: 20, opacity: 0.9 },
  proBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proBadgeText: { color: '#fff', fontSize: 12 },
  planName: { color: '#fff', fontSize: 36, lineHeight: 44, marginBottom: 2 },
  planPrice: { color: '#fff', fontSize: 16, lineHeight: 24, opacity: 0.9 },
  nextBilling: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    opacity: 0.85,
  },
  daysLeft: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  daysLeftText: { color: '#fff', fontSize: 13 },
  upgradeCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  upgradeTitle: { fontSize: 20, lineHeight: 28, marginBottom: 4 },
  upgradePrice: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  featureList: { gap: 8, marginBottom: 20 },
  feature: { fontSize: 14, lineHeight: 22 },
  upgradeButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  upgradeButtonText: { color: '#fff', fontSize: 15 },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  paymentIcon: { fontSize: 28 },
  paymentInfo: { flex: 1 },
  paymentText: { fontSize: 15, lineHeight: 22 },
  paymentSub: { fontSize: 13, lineHeight: 20, marginTop: 1 },
  usageContainer: { padding: 20, gap: 0 },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageLabel: { fontSize: 15, lineHeight: 22 },
  usageValue: { fontSize: 14, lineHeight: 20 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  invoiceList: { marginHorizontal: 20, borderRadius: 12, overflow: 'hidden' },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  invoiceLeft: { flex: 1, gap: 2 },
  invoiceDate: { fontSize: 14, lineHeight: 20 },
  invoiceMethod: { fontSize: 12, lineHeight: 18 },
  invoiceError: { fontSize: 12, lineHeight: 18, color: '#EF4444' }, // overridden inline with colors.error
  invoiceRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  invoiceAmount: { fontSize: 15, lineHeight: 22 },
  invoiceStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  invoiceStatusText: { fontSize: 12 },
  cancelContainer: { marginHorizontal: 20, marginTop: 8, marginBottom: 8 },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: { fontSize: 15 },
  cancelNotice: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelNoticeText: { fontSize: 13, lineHeight: 20 },
})
