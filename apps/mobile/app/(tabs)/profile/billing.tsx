import { SettingsRow } from '@/components/settings/SettingsRow';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { useThemeColors } from '@/constants/useTheme';
import { apiClient } from '@/lib/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BillingInfo {
  subscription: {
    plan: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
    status: string;
    maxRecipes: number;
    maxUsers: number;
    maxLists: number;
    aiCreditsLimit: number;
    aiCreditsUsed: number;
    stripeCurrentPeriodEnd?: string;
  };
  usage: {
    recipeCount: number;
    userCount: number;
    listCount: number;
  };
}

const PLAN_INFO = {
  FREE: {
    name: 'Free',
    price: '$0',
    color: '#6B7280',
  },
  BASIC: {
    name: 'Basic',
    price: '$9.99',
    color: '#3B82F6',
  },
  PRO: {
    name: 'Pro',
    price: '$19.99',
    color: '#8B5CF6',
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 'Custom',
    color: '#EC4899',
  },
};

export default function BillingScreen() {
  const colors = useThemeColors();

  const { data: billingInfo, isLoading } = useQuery({
    queryKey: ['billing'],
    queryFn: async () => {
      const response = await apiClient().get<BillingInfo>('/user/billing');
      return response.data;
    },
  });

  const handleUpgrade = () => {
    Alert.alert('Upgrade Plan', 'Choose a plan to unlock more features', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'View Plans',
        onPress: () => {
          Alert.alert('Coming Soon', 'Plan upgrades will be available soon');
        },
      },
    ]);
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const subscription = billingInfo?.subscription;
  const usage = billingInfo?.usage;
  const planInfo = subscription ? PLAN_INFO[subscription.plan] : PLAN_INFO.FREE;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.backgroundSecondary },
      ]}
      edges={['bottom']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Plan Card */}
        <View style={styles.planCard}>
          <LinearGradient
            colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.planGradient}
          >
            <Text
              style={[styles.planLabel, { fontFamily: 'Poppins_500Medium' }]}
            >
              Current Plan
            </Text>
            <Text
              style={[styles.planName, { fontFamily: 'EBGaramond_700Bold' }]}
            >
              {planInfo.name}
            </Text>
            <Text
              style={[styles.planPrice, { fontFamily: 'Poppins_400Regular' }]}
            >
              {planInfo.price}
              {subscription?.plan !== 'FREE' && '/month'}
            </Text>
            {subscription?.plan === 'FREE' && (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgrade}
              >
                <Text
                  style={[
                    styles.upgradeButtonText,
                    {
                      color: colors.primary,
                      fontFamily: 'Poppins_500Medium',
                    },
                  ]}
                >
                  Upgrade Plan
                </Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>

        {/* Usage Section */}
        <SettingsSection title='Usage & Limits'>
          <View style={styles.usageContainer}>
            {/* Recipes */}
            <View style={styles.usageItem}>
              <View style={styles.usageHeader}>
                <Text
                  style={[
                    styles.usageLabel,
                    {
                      color: colors.textPrimary,
                      fontFamily: 'Poppins_500Medium',
                    },
                  ]}
                >
                  Recipes
                </Text>
                <Text
                  style={[
                    styles.usageValue,
                    {
                      color: colors.textSecondary,
                      fontFamily: 'Poppins_400Regular',
                    },
                  ]}
                >
                  {usage?.recipeCount || 0} / {subscription?.maxRecipes || 0}
                </Text>
              </View>
              <View
                style={[styles.progressBar, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getUsagePercentage(
                        usage?.recipeCount || 0,
                        subscription?.maxRecipes || 1
                      )}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
            </View>

            {/* AI Credits */}
            <View style={styles.usageItem}>
              <View style={styles.usageHeader}>
                <Text
                  style={[
                    styles.usageLabel,
                    {
                      color: colors.textPrimary,
                      fontFamily: 'Poppins_500Medium',
                    },
                  ]}
                >
                  AI Credits
                </Text>
                <Text
                  style={[
                    styles.usageValue,
                    {
                      color: colors.textSecondary,
                      fontFamily: 'Poppins_400Regular',
                    },
                  ]}
                >
                  {subscription?.aiCreditsUsed || 0} /{' '}
                  {subscription?.aiCreditsLimit || 0}
                </Text>
              </View>
              <View
                style={[styles.progressBar, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getUsagePercentage(
                        subscription?.aiCreditsUsed || 0,
                        subscription?.aiCreditsLimit || 1
                      )}%`,
                      backgroundColor: colors.ai,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Lists */}
            <View style={styles.usageItem}>
              <View style={styles.usageHeader}>
                <Text
                  style={[
                    styles.usageLabel,
                    {
                      color: colors.textPrimary,
                      fontFamily: 'Poppins_500Medium',
                    },
                  ]}
                >
                  Shopping Lists
                </Text>
                <Text
                  style={[
                    styles.usageValue,
                    {
                      color: colors.textSecondary,
                      fontFamily: 'Poppins_400Regular',
                    },
                  ]}
                >
                  {usage?.listCount || 0} / {subscription?.maxLists || 0}
                </Text>
              </View>
              <View
                style={[styles.progressBar, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getUsagePercentage(
                        usage?.listCount || 0,
                        subscription?.maxLists || 1
                      )}%`,
                      backgroundColor: colors.food,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </SettingsSection>

        {subscription?.plan !== 'FREE' && (
          <SettingsSection title='Billing'>
            <SettingsRow
              icon={<Text style={styles.icon}>💳</Text>}
              title='Payment Method'
              subtitle='Manage your payment methods'
              chevron
              onPress={() =>
                Alert.alert('Coming Soon', 'Payment management coming soon')
              }
            />
            <SettingsRow
              icon={<Text style={styles.icon}>📄</Text>}
              title='Billing History'
              subtitle='View past invoices'
              chevron
              onPress={() =>
                Alert.alert('Coming Soon', 'Billing history coming soon')
              }
            />
            <SettingsRow
              icon={<Text style={styles.icon}>🔄</Text>}
              title='Manage Subscription'
              subtitle='Cancel or change your plan'
              chevron
              onPress={() =>
                Alert.alert(
                  'Coming Soon',
                  'Subscription management coming soon'
                )
              }
            />
          </SettingsSection>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  planGradient: {
    padding: 24,
    alignItems: 'center',
  },
  planLabel: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
    marginBottom: 4,
  },
  planName: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 40,
    marginBottom: 4,
  },
  planPrice: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 26,
    opacity: 0.95,
  },
  upgradeButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 24,
  },
  upgradeButtonText: {
    fontSize: 15,
    lineHeight: 22,
  },
  usageContainer: {
    padding: 20,
    gap: 24,
  },
  usageItem: {
    gap: 8,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usageLabel: {
    fontSize: 15,
    lineHeight: 22,
  },
  usageValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  icon: {
    fontSize: 20,
  },
});
