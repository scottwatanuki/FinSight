// app/components/FinancialInsightsCard.jsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const FinancialInsightsCard = ({ insights = [], onViewAll }) => {
  // Default insights if none provided
  const defaultInsights = [
    {
      id: "1",
      type: "warning",
      message: "Bills spending is 50% over your monthly budget",
      actionText: "Review",
    },
    {
      id: "2",
      type: "tip",
      message: "You could save $120 by reducing food spending by 15%",
      actionText: "See How",
    },
    {
      id: "3",
      type: "achievement",
      message: "Great job! Your health spending is under budget this month",
      actionText: "Details",
    },
  ];

  const displayInsights = insights.length > 0 ? insights : defaultInsights;

  // Get icon based on insight type
  const getInsightIcon = (type) => {
    switch (type) {
      case "warning":
        return "alert-triangle";
      case "tip":
        return "zap";
      case "achievement":
        return "award";
      default:
        return "info";
    }
  };

  // Get color based on insight type
  const getInsightColor = (type) => {
    switch (type) {
      case "warning":
        return "#FF8A65"; // Orange
      case "tip":
        return "#42A5F5"; // Blue
      case "achievement":
        return "#4CAF50"; // Green
      default:
        return "#6C63FF"; // Purple
    }
  };

  const renderInsightItem = (item) => {
    const iconName = getInsightIcon(item.type);
    const color = getInsightColor(item.type);

    return (
      <View key={item.id} style={styles.insightItem}>
        <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
          <Feather name={iconName} size={20} color={color} />
        </View>
        <View style={styles.insightContent}>
          <Text style={styles.insightMessage}>{item.message}</Text>
          <View style={styles.insightFooter}>
            <TouchableOpacity
              style={[styles.insightAction, { borderColor: color }]}
            >
              <Text style={[styles.insightActionText, { color }]}>
                {item.actionText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Insights</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.insightsContainer}>
        {displayInsights.map(renderInsightItem)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  viewAll: {
    color: "#4C38CD",
    fontWeight: "500",
  },
  insightsContainer: {
    marginTop: 5,
  },
  insightItem: {
    flexDirection: "row",
    marginBottom: 15,
    padding: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  insightFooter: {
    flexDirection: "row",
  },
  insightAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  insightActionText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default FinancialInsightsCard;
