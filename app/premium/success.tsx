import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function SubscriptionSuccess() {
  const router = useRouter();

  const handleGoToInsights = () => {
    router.push("/premium/insights");
  };

  const handleGoToHome = () => {
    router.push("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.successIconContainer}>
          <View style={styles.successIconCircle}>
            <Feather name="check" size={60} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.title}>Welcome to Premium!</Text>

        <Text style={styles.message}>
          Your subscription has been successfully activated. You now have access
          to all premium features.
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Feather name="trending-up" size={24} color="#4C38CD" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Insight Tracker</Text>
              <Text style={styles.featureDescription}>
                Gain deeper understanding of your spending patterns with
                personalized insights
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Feather name="zap" size={24} color="#4C38CD" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Budget Automation</Text>
              <Text style={styles.featureDescription}>
                Let AI adjust your budgets based on your spending habits
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Feather name="target" size={24} color="#4C38CD" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Unlimited Goals</Text>
              <Text style={styles.featureDescription}>
                Create as many savings goals as you need with detailed tracking
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.subscriptionDetails}>
          <Text style={styles.subscriptionTitle}>Subscription Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plan</Text>
            <Text style={styles.detailValue}>Premium Monthly</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>$8.99/month</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Next Billing</Text>
            <Text style={styles.detailValue}>June 15, 2023</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>Visa •••• 1234</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGoToInsights}
        >
          <Text style={styles.primaryButtonText}>Explore Insights</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleGoToHome}
        >
          <Text style={styles.secondaryButtonText}>Go to Dashboard</Text>
        </TouchableOpacity>

        <Text style={styles.supportText}>
          Need help with your subscription? Contact our support team at
          support@finsight.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    padding: 24,
    alignItems: "center",
    paddingBottom: 40,
  },
  successIconContainer: {
    marginVertical: 30,
  },
  successIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    color: "#666666",
    marginBottom: 30,
    lineHeight: 24,
  },
  featuresContainer: {
    width: "100%",
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F1FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  subscriptionDetails: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: "#4C38CD",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "#F3F1FF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4C38CD",
  },
  supportText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
});
