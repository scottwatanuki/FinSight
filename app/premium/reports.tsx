const React = require( "react");
const {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} = require( "react-native");
const { useRouter } = require( "expo-router");
const { Feather } = require( "@expo/vector-icons");

export default function AdvancedReports() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Reports</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.banner}>
          <Feather name="bar-chart-2" size={40} color="#FFF" />
          <Text style={styles.bannerTitle}>Advanced Reports</Text>
          <Text style={styles.bannerText}>
            Deep dive into your spending patterns with detailed financial
            reports
          </Text>
        </View>

        <View style={styles.comingSoonContainer}>
          <Feather name="clock" size={60} color="#4C38CD" />
          <Text style={styles.comingSoonTitle}>Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            We're currently building this feature. It will be available in the
            next update. Check back soon for detailed financial reports and
            analysis.
          </Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  banner: {
    backgroundColor: "#4C38CD",
    padding: 30,
    alignItems: "center",
    margin: 20,
    borderRadius: 16,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 15,
    marginBottom: 10,
  },
  bannerText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
  },
  comingSoonContainer: {
    alignItems: "center",
    margin: 20,
    padding: 30,
    backgroundColor: "#F3F1FF",
    borderRadius: 16,
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#4C38CD",
  },
  comingSoonText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 24,
  },
});
