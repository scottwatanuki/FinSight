import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";

// Real LineChart component is now imported from react-native-chart-kit

export default function InsightsTracker() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("spending");
  const [timeframe, setTimeframe] = useState("month");

  const screenWidth = Dimensions.get("window").width - 40;

  const renderInsightCard = (
    type: "opportunity" | "warning" | "achievement" | "info",
    title: string,
    description: string,
    actionText: string
  ) => {
    const getIconAndColor = () => {
      switch (type) {
        case "opportunity":
          return { icon: "zap", color: "#4C38CD" };
        case "warning":
          return { icon: "alert-triangle", color: "#FF8A65" };
        case "achievement":
          return { icon: "award", color: "#4CAF50" };
        default:
          return { icon: "info", color: "#6C63FF" };
      }
    };

    const { icon, color } = getIconAndColor();

    return (
      <View style={styles.insightCard}>
        <View
          style={[
            styles.insightIconContainer,
            { backgroundColor: color + "20" },
          ]}
        >
          <Feather name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>{title}</Text>
          <Text style={styles.insightDescription}>{description}</Text>
          <TouchableOpacity
            style={[styles.insightButton, { borderColor: color }]}
          >
            <Text style={[styles.insightButtonText, { color }]}>
              {actionText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSpendingTab = () => {
    const data = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          data: [3200, 3450, 2950, 3600, 3200, 2800],
          color: (opacity = 1) => `rgba(76, 56, 205, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ["Spending"],
    };

    const chartConfig = {
      backgroundGradientFrom: "#ffffff",
      backgroundGradientFromOpacity: 0,
      backgroundGradientTo: "#ffffff",
      backgroundGradientToOpacity: 0,
      color: (opacity = 1) => `rgba(76, 56, 205, ${opacity})`,
      strokeWidth: 2,
      decimalPlaces: 0,
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#4C38CD",
      },
    };

    return (
      <>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Monthly Spending Trends</Text>
          <LineChart
            data={data}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            withInnerLines={false}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
          <View style={styles.chartSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Monthly Avg</Text>
              <Text style={styles.summaryValue}>$3,200</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>6m Trend</Text>
              <Text style={[styles.summaryValue, { color: "#FF8A65" }]}>
                +4.5%
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>This Month</Text>
              <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
                -12%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>Personalized Insights</Text>

          {renderInsightCard(
            "opportunity",
            "Subscription Opportunity",
            "We found 3 overlapping media subscriptions that could save you $27/month if consolidated.",
            "See Details"
          )}

          {renderInsightCard(
            "warning",
            "Bills Category Alert",
            "Your electricity bills have increased by 22% compared to the same period last year.",
            "Investigate"
          )}

          {renderInsightCard(
            "achievement",
            "Grocery Spending Win",
            "Your grocery spending has decreased by 15% this month, meeting your reduction goal!",
            "View Analysis"
          )}
        </View>
      </>
    );
  };

  const renderSavingsTab = () => {
    const data = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          data: [500, 700, 800, 1200, 1500, 1800],
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ["Savings"],
    };

    const chartConfig = {
      backgroundGradientFrom: "#ffffff",
      backgroundGradientFromOpacity: 0,
      backgroundGradientTo: "#ffffff",
      backgroundGradientToOpacity: 0,
      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
      strokeWidth: 2,
      decimalPlaces: 0,
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#4CAF50",
      },
    };

    return (
      <>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Savings Growth</Text>
          <LineChart
            data={data}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            withInnerLines={false}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
          <View style={styles.chartSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Saved</Text>
              <Text style={styles.summaryValue}>$1,800</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Monthly Avg</Text>
              <Text style={styles.summaryValue}>$300</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Growth</Text>
              <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
                +20%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>Savings Insights</Text>

          {renderInsightCard(
            "opportunity",
            "Savings Accelerator",
            "Based on your spending patterns, you could increase your monthly savings by $150.",
            "View Plan"
          )}

          {renderInsightCard(
            "achievement",
            "Emergency Fund Progress",
            "You've reached 65% of your emergency fund goal. Keep it up!",
            "See Details"
          )}

          {renderInsightCard(
            "warning",
            "Savings Rate Alert",
            "Your savings rate has decreased from 15% to 12% in the last 3 months.",
            "Get Tips"
          )}
        </View>
      </>
    );
  };

  const renderGoalsTab = () => {
    return (
      <View style={styles.goalsContainer}>
        <Text style={styles.sectionTitle}>Your Financial Goals</Text>

        {/* Goal 1 */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Emergency Fund</Text>
            <Text style={styles.goalDeadline}>Dec 2023</Text>
          </View>

          <View style={styles.goalAmounts}>
            <Text style={styles.goalCurrentAmount}>$6,500</Text>
            <Text style={styles.goalTargetAmount}>of $10,000</Text>
          </View>

          <View style={styles.goalProgressContainer}>
            <View style={styles.goalProgressBar}>
              <View style={[styles.goalProgress, { width: "65%" }]} />
            </View>
            <Text style={styles.goalPercentage}>65%</Text>
          </View>

          <View style={styles.goalInsight}>
            <Feather name="trending-up" size={18} color="#4CAF50" />
            <Text style={styles.goalInsightText}>
              On track. Projected completion in 5 months.
            </Text>
          </View>
        </View>

        {/* Goal 2 */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>New Car</Text>
            <Text style={styles.goalDeadline}>Jun 2024</Text>
          </View>

          <View style={styles.goalAmounts}>
            <Text style={styles.goalCurrentAmount}>$8,500</Text>
            <Text style={styles.goalTargetAmount}>of $15,000</Text>
          </View>

          <View style={styles.goalProgressContainer}>
            <View style={styles.goalProgressBar}>
              <View style={[styles.goalProgress, { width: "56.6%" }]} />
            </View>
            <Text style={styles.goalPercentage}>57%</Text>
          </View>

          <View style={styles.goalInsight}>
            <Feather name="alert-triangle" size={18} color="#FF8A65" />
            <Text style={styles.goalInsightText}>
              Falling behind. Increase monthly deposit by $120 to stay on track.
            </Text>
          </View>
        </View>

        {/* Goal 3 */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Vacation Fund</Text>
            <Text style={styles.goalDeadline}>Aug 2023</Text>
          </View>

          <View style={styles.goalAmounts}>
            <Text style={styles.goalCurrentAmount}>$2,800</Text>
            <Text style={styles.goalTargetAmount}>of $3,000</Text>
          </View>

          <View style={styles.goalProgressContainer}>
            <View style={styles.goalProgressBar}>
              <View style={[styles.goalProgress, { width: "93.3%" }]} />
            </View>
            <Text style={styles.goalPercentage}>93%</Text>
          </View>

          <View style={styles.goalInsight}>
            <Feather name="award" size={18} color="#4CAF50" />
            <Text style={styles.goalInsightText}>
              Almost there! Just $200 more to reach your goal.
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insight Tracker</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Feather name="share-2" size={24} color="#4C38CD" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "spending" && styles.activeTab]}
          onPress={() => setSelectedTab("spending")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "spending" && styles.activeTabText,
            ]}
          >
            Spending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "savings" && styles.activeTab]}
          onPress={() => setSelectedTab("savings")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "savings" && styles.activeTabText,
            ]}
          >
            Savings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "goals" && styles.activeTab]}
          onPress={() => setSelectedTab("goals")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "goals" && styles.activeTabText,
            ]}
          >
            Goals
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timeframeContainer}>
        <TouchableOpacity
          style={[
            styles.timeframeButton,
            timeframe === "month" && styles.activeTimeframe,
          ]}
          onPress={() => setTimeframe("month")}
        >
          <Text
            style={[
              styles.timeframeText,
              timeframe === "month" && styles.activeTimeframeText,
            ]}
          >
            Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.timeframeButton,
            timeframe === "quarter" && styles.activeTimeframe,
          ]}
          onPress={() => setTimeframe("quarter")}
        >
          <Text
            style={[
              styles.timeframeText,
              timeframe === "quarter" && styles.activeTimeframeText,
            ]}
          >
            Quarter
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.timeframeButton,
            timeframe === "year" && styles.activeTimeframe,
          ]}
          onPress={() => setTimeframe("year")}
        >
          <Text
            style={[
              styles.timeframeText,
              timeframe === "year" && styles.activeTimeframeText,
            ]}
          >
            Year
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {selectedTab === "spending" && renderSpendingTab()}
        {selectedTab === "savings" && renderSavingsTab()}
        {selectedTab === "goals" && renderGoalsTab()}
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
  headerAction: {
    padding: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4C38CD",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666666",
  },
  activeTabText: {
    color: "#4C38CD",
    fontWeight: "600",
  },
  timeframeContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
    backgroundColor: "#F8F8F8",
  },
  timeframeButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeTimeframe: {
    backgroundColor: "#4C38CD",
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  activeTimeframeText: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  chartSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  insightsContainer: {
    marginBottom: 20,
  },
  insightCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  insightIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  insightDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 10,
  },
  insightButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  insightButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  goalsContainer: {
    marginBottom: 20,
  },
  goalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  goalDeadline: {
    fontSize: 14,
    color: "#666666",
  },
  goalAmounts: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  goalCurrentAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4C38CD",
    marginRight: 5,
  },
  goalTargetAmount: {
    fontSize: 16,
    color: "#666666",
  },
  goalProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  goalProgressBar: {
    flex: 1,
    height: 10,
    backgroundColor: "#F0F0F0",
    borderRadius: 5,
    marginRight: 10,
    overflow: "hidden",
  },
  goalProgress: {
    height: "100%",
    backgroundColor: "#4C38CD",
    borderRadius: 5,
  },
  goalPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4C38CD",
    width: 40,
    textAlign: "right",
  },
  goalInsight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    padding: 10,
    borderRadius: 10,
  },
  goalInsightText: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 8,
    flex: 1,
  },
});
