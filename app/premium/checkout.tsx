const React = require( "react");
const { useState } = require( "react"); 
const {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} require("react-native");
const { useRouter } = require(  "expo-router");
const { useAuth } = require(  "../context/AuthContext");
const { Feather } = require(  "@expo/vector-icons");

interface CardDetails {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">(
    "annual"
  );
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "paypal">(
    "credit"
  );
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);

  const formatCardNumber = (text: string): string => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Add space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.substring(0, 19);
  };

  const formatExpiry = (text: string): string => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Format as MM/YY
    if (cleaned.length > 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    setCardDetails({ ...cardDetails, number: formatCardNumber(text) });
  };

  const handleExpiryChange = (text: string) => {
    setCardDetails({ ...cardDetails, expiry: formatExpiry(text) });
  };

  const handleSubscribe = () => {
    setLoading(true);

    // Simulate subscription process
    setTimeout(() => {
      setLoading(false);
      // Navigate to success page
      router.push("/premium/success");
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Complete Your Subscription</Text>

        {/* Plan Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Plan</Text>
          <View style={styles.planToggleContainer}>
            <TouchableOpacity
              style={[
                styles.planOption,
                selectedPlan === "monthly" && styles.selectedPlan,
              ]}
              onPress={() => setSelectedPlan("monthly")}
            >
              <Text
                style={[
                  styles.planOptionText,
                  selectedPlan === "monthly" && styles.selectedPlanText,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.planOption,
                selectedPlan === "annual" && styles.selectedPlan,
              ]}
              onPress={() => setSelectedPlan("annual")}
            >
              <Text
                style={[
                  styles.planOptionText,
                  selectedPlan === "annual" && styles.selectedPlanText,
                ]}
              >
                Annual
              </Text>
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsBadgeText}>Save 20%</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Plan Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Summary</Text>
          <View style={styles.planSummaryCard}>
            <Text style={styles.planName}>
              {selectedPlan === "monthly"
                ? "Monthly Premium"
                : "Annual Premium"}
            </Text>
            <Text style={styles.planPrice}>
              {selectedPlan === "monthly" ? "$9.99/month" : "$95.88/year"}
            </Text>
            {selectedPlan === "annual" && (
              <Text style={styles.savingsText}>
                You save $23.88 compared to monthly
              </Text>
            )}
            <View style={styles.divider} />
            <Text style={styles.featuresTitle}>Premium Features:</Text>
            <View style={styles.featureItem}>
              <Feather name="check" size={18} color="#4CAF50" />
              <Text style={styles.featureText}>Insight Tracker</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="check" size={18} color="#4CAF50" />
              <Text style={styles.featureText}>Budget Automation</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="check" size={18} color="#4CAF50" />
              <Text style={styles.featureText}>Unlimited Goals</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "credit" && styles.selectedPayment,
              ]}
              onPress={() => setPaymentMethod("credit")}
            >
              <Feather
                name="credit-card"
                size={24}
                color={paymentMethod === "credit" ? "#3498db" : "#666"}
              />
              <Text
                style={[
                  styles.paymentOptionText,
                  paymentMethod === "credit" && styles.selectedPaymentText,
                ]}
              >
                Credit Card
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "paypal" && styles.selectedPayment,
              ]}
              onPress={() => setPaymentMethod("paypal")}
            >
              <Text
                style={[
                  styles.paypalIcon,
                  paymentMethod === "paypal" && styles.selectedPaymentText,
                ]}
              >
                P
              </Text>
              <Text
                style={[
                  styles.paymentOptionText,
                  paymentMethod === "paypal" && styles.selectedPaymentText,
                ]}
              >
                PayPal
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Credit Card Information */}
        {paymentMethod === "credit" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Card Information</Text>
            <View style={styles.cardForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="numeric"
                  value={cardDetails.number}
                  onChangeText={handleCardNumberChange}
                  maxLength={19}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Expiry</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    keyboardType="numeric"
                    value={cardDetails.expiry}
                    onChangeText={handleExpiryChange}
                    maxLength={5}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    keyboardType="numeric"
                    secureTextEntry
                    value={cardDetails.cvv}
                    onChangeText={(text) =>
                      setCardDetails({ ...cardDetails, cvv: text })
                    }
                    maxLength={3}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChangeText={(text) =>
                    setCardDetails({ ...cardDetails, name: text })
                  }
                />
              </View>
            </View>
          </View>
        )}

        {/* PayPal */}
        {paymentMethod === "paypal" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PayPal</Text>
            <Text style={styles.paypalText}>
              You will be redirected to PayPal to complete your payment after
              clicking "Subscribe Now".
            </Text>
          </View>
        )}

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.subscribeButton, loading && styles.loadingButton]}
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.subscribeButtonText}>Processing...</Text>
          ) : (
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  planToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#eaeaea",
    borderRadius: 10,
    overflow: "hidden",
  },
  planOption: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  selectedPlan: {
    backgroundColor: "#3498db",
  },
  planOptionText: {
    fontWeight: "600",
    fontSize: 16,
    color: "#555",
  },
  selectedPlanText: {
    color: "white",
    fontWeight: "bold",
  },
  savingsBadge: {
    position: "absolute",
    top: 3,
    right: 3,
    backgroundColor: "#e74c3c",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  savingsBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  planSummaryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3498db",
    marginTop: 4,
  },
  savingsText: {
    fontSize: 14,
    color: "#e74c3c",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#eaeaea",
    marginVertical: 15,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 15,
    color: "#555",
  },
  paymentOptions: {
    flexDirection: "row",
    marginBottom: 15,
  },
  paymentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedPayment: {
    borderColor: "#3498db",
    backgroundColor: "#f0f8ff",
  },
  paymentOptionText: {
    marginLeft: 8,
    fontSize: 15,
    color: "#555",
    fontWeight: "500",
  },
  selectedPaymentText: {
    color: "#3498db",
    fontWeight: "bold",
  },
  paypalIcon: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#666",
  },
  cardForm: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
  },
  inputLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  paypalText: {
    fontSize: 15,
    color: "#555",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subscribeButton: {
    backgroundColor: "#3498db",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  loadingButton: {
    backgroundColor: "#86b8e3",
  },
  subscribeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
