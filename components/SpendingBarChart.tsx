import React from "react";
import { View, Text, StyleSheet } from "react-native";

const SpendingBarChart = ({
  data,
  height = 200,
  barWidth = 30,
  barColor = "#6C63FF",
  budgetLineColor = "#ddd",
  overBudgetColor = "#FF5757",
}) => {
  // Find the maximum value for scaling
  const maxValue = Math.max(
    ...data.map((item) => Math.max(item.spent, item.budget))
  );

  // Calculate the y-axis labels based on the max value
  const yLabels = ["0"];
  const steps = 3;
  for (let i = 1; i <= steps; i++) {
    const value = Math.round((maxValue / steps) * i);
    yLabels.unshift(
      value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()
    );
  }

  return (
    <View style={styles.container}>
      {/* Y-Axis Labels */}
      <View style={styles.yAxis}>
        {yLabels.map((label, index) => (
          <Text key={index} style={styles.yLabel}>
            {label}
          </Text>
        ))}
      </View>

      {/* Chart Area */}
      <View style={[styles.chartArea, { height }]}>
        {data.map((item, index) => (
          <View key={index} style={styles.barGroup}>
            <View style={[styles.barColumn, { height: "100%" }]}>
              {/* Over budget indicator */}
              {item.spent > item.budget && (
                <View style={styles.overBudgetIndicator}>
                  <View
                    style={[
                      styles.overBudgetDot,
                      { backgroundColor: overBudgetColor },
                    ]}
                  ></View>
                </View>
              )}

              {/* The actual bar */}
              <View
                style={[
                  styles.bar,
                  {
                    height: `${(item.spent / maxValue) * 100}%`,
                    width: barWidth,
                    backgroundColor: item.color || barColor,
                  },
                ]}
              />

              {/* Budget line indicator */}
              <View
                style={[
                  styles.budgetLine,
                  {
                    bottom: `${(item.budget / maxValue) * 100}%`,
                    backgroundColor: budgetLineColor,
                  },
                ]}
              >
                <View
                  style={[
                    styles.budgetDot,
                    { backgroundColor: overBudgetColor },
                  ]}
                ></View>
              </View>
              categories = [
                  "entertainment",
                  "travel",
                  "bills",
                  "groceries",
                  "dining",
                  "subscriptions",
                  "transportation",
                  "recreational",
                  "shopping",
                  "health",
                  "misc",
              ];
              {/* Category name label */}
              
            </View>
            <Text style={styles.barLabel}>{item.name.substring(0,3)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingBottom: 20,
  },
  yAxis: {
    width: 35,
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingRight: 5,
  },
  yLabel: {
    fontSize: 11,
    color: "#999",
  },
  chartArea: {
    marginTop: 20,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  barGroup: {
    alignItems: "center",
    flex: 1,
  },
  barColumn: {
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
  },
  bar: {
    backgroundColor: "#6C63FF",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    position: "relative",
  },
  budgetLine: {
    position: "absolute",
    width: 40,
    height: 1,
  },
  budgetDot: {
    position: "absolute",
    right: -4,
    top: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "white",
  },
  overBudgetIndicator: {
    position: "absolute",
    top: -15,
    zIndex: 2,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  // overBudgetDot: {
  //   width: 10,
  //   height: 10,
  //   borderRadius: 5,
  //   borderWidth: 1,
  //   borderColor: "white",
  // },
  barLabel: {
    marginTop: 0,

    fontSize: 12,
    color: "#333",
  },
});

export default SpendingBarChart;
