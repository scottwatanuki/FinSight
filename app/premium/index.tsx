const React  = require( "react");
const {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
}  = require( "react-native");
const { useRouter }  = require( "expo-router");
const { Feather }  = require( "@expo/vector-icons");
const { useAuth }  = require( "../context/AuthContext");

export default function PremiumPlan() {
  const router = useRouter();
  const { user } = useAuth();

  const handleUpgradePress = () => {
    router.push("/premium/checkout" as any);
  };

  const handleFeaturePress = (featurePath: string) => {
    router.push(featurePath as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium Plan</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Premium Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Feather name="star" size={40} color="#FFC107" />
            <Text style={styles.bannerTitle}>Unlock FinSight Premium</Text>
            <Text style={styles.bannerSubtitle}>
              Gain access to exclusive features to take control of your finances
            </Text>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgradePress}
            >
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Premium Features</Text>

          {/* Feature 1: Insight Tracker */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => handleFeaturePress("/premium/insights")}
          >
            <View style={styles.featureIconContainer}>
              <Feather name="trending-up" size={24} color="#4C38CD" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Insight Tracker</Text>
              <Text style={styles.featureDescription}>
                Get personalized financial insights and track your progress over
                time
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>

          {/* Feature 2: Budget Automation */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => handleFeaturePress("/premium/automation")}
          >
            <View style={styles.featureIconContainer}>
              <Feather name="zap" size={24} color="#4C38CD" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Budget Automation</Text>
              <Text style={styles.featureDescription}>
                Automatically adjust budgets based on your spending habits
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>

          {/* Feature 3: Advanced Reports */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => handleFeaturePress("/premium/reports")}
          >
            <View style={styles.featureIconContainer}>
              <Feather name="bar-chart-2" size={24} color="#4C38CD" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Advanced Reports</Text>
              <Text style={styles.featureDescription}>
                Deep dive into your spending patterns with detailed reports
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Pricing Section */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>Pricing</Text>

          <View style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <Text style={styles.pricingTitle}>Premium Plan</Text>
              <View style={styles.pricingBadge}>
                <Text style={styles.pricingBadgeText}>MOST POPULAR</Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>$8.99</Text>
              <Text style={styles.pricePeriod}>/month</Text>
            </View>

            <View style={styles.pricingFeatures}>
              <View style={styles.pricingFeatureItem}>
                <Feather name="check" size={18} color="#4CAF50" />
                <Text style={styles.pricingFeatureText}>
                  Unlimited savings goals
                </Text>
              </View>
              <View style={styles.pricingFeatureItem}>
                <Feather name="check" size={18} color="#4CAF50" />
                <Text style={styles.pricingFeatureText}>
                  Personalized insights
                </Text>
              </View>
              <View style={styles.pricingFeatureItem}>
                <Feather name="check" size={18} color="#4CAF50" />
                <Text style={styles.pricingFeatureText}>Budget automation</Text>
              </View>
              <View style={styles.pricingFeatureItem}>
                <Feather name="check" size={18} color="#4CAF50" />
                <Text style={styles.pricingFeatureText}>
                  Advanced analytics
                </Text>
              </View>
              <View style={styles.pricingFeatureItem}>
                <Feather name="check" size={18} color="#4CAF50" />
                <Text style={styles.pricingFeatureText}>Email reports</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={handleUpgradePress}
            >
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.annualPlanButton} onPress={() => {}}>
            <Text style={styles.annualPlanText}>
              See Annual Plan (Save 20%)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Testimonials Section */}
        <View style={styles.testimonialsSection}>
          <Text style={styles.sectionTitle}>What Users Say</Text>

          <View style={styles.testimonialCard}>
            <Text style={styles.testimonialText}>
              "FinSight Premium helped me save an extra $320 per month by
              showing me exactly where my money was going!"
            </Text>
            <View style={styles.testimonialAuthor}>
              <Text style={styles.testimonialName}>Sarah J.</Text>
              <Text style={styles.testimonialRole}>Premium User</Text>
            </View>
          </View>

          <View style={styles.testimonialCard}>
            <Text style={styles.testimonialText}>
              "The insights feature is game-changing. I finally understood my
              spending habits and made meaningful changes."
            </Text>
            <View style={styles.testimonialAuthor}>
              <Text style={styles.testimonialName}>Michael T.</Text>
              <Text style={styles.testimonialRole}>Premium User</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  banner: {
    backgroundColor: "#4C38CD",
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginBottom: 20,
  },
  bannerContent: {
    alignItems: "center",
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 15,
    marginBottom: 10,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.9,
  },
  upgradeButton: {
    backgroundColor: "#FFC107",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F3F1FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  featureContent: {
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
  pricingSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  pricingCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  pricingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pricingBadge: {
    backgroundColor: "#4C38CD",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pricingBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  price: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4C38CD",
  },
  pricePeriod: {
    fontSize: 16,
    color: "#666666",
    marginLeft: 4,
  },
  pricingFeatures: {
    marginBottom: 20,
  },
  pricingFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  pricingFeatureText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#333333",
  },
  subscribeButton: {
    backgroundColor: "#4C38CD",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  annualPlanButton: {
    alignItems: "center",
    marginTop: 15,
  },
  annualPlanText: {
    fontSize: 16,
    color: "#4C38CD",
    fontWeight: "500",
  },
  testimonialsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  testimonialCard: {
    backgroundColor: "#F3F1FF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
  },
  testimonialText: {
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 24,
    marginBottom: 12,
  },
  testimonialAuthor: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  testimonialName: {
    fontSize: 14,
    fontWeight: "600",
  },
  testimonialRole: {
    fontSize: 14,
    color: "#666666",
  },
});
