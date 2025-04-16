// app/components/MonthlySpendingChart.jsx
const React = require( "react");
const { View, Text, StyleSheet, Dimensions } = require( "react-native");

const MonthlySpendingChart = ({
  data = [],
  height = 180,
  barWidth = 12,
  barGap = 8,
  barColor = "#6C63FF",
  barRadius = 6,
}) => {
  // Default data if none provided
  const defaultData = [
    { day: 1, amount: 120 },
    { day: 2, amount: 85 },
    { day: 3, amount: 45 },
    { day: 4, amount: 95 },
    { day: 5, amount: 60 },
    { day: 6, amount: 140 },
    { day: 7, amount: 180 },
    { day: 8, amount: 130 },
    { day: 9, amount: 75 },
    { day: 10, amount: 110 },
    { day: 11, amount: 160 },
    { day: 12, amount: 95 },
    { day: 13, amount: 30 },
    { day: 14, amount: 80 },
    { day: 15, amount: 120 },
    { day: 16, amount: 100 },
    { day: 17, amount: 45 },
    { day: 18, amount: 160 },
    { day: 19, amount: 75 },
    { day: 20, amount: 130 },
    { day: 21, amount: 195 },
    { day: 22, amount: 120 },
    { day: 23, amount: 90 },
    { day: 24, amount: 85 },
    { day: 25, amount: 55 },
    { day: 26, amount: 40 },
    { day: 27, amount: 75 },
    { day: 28, amount: 110 },
    { day: 29, amount: 65 },
    { day: 30, amount: 100 },
  ];

  const displayData = data.length > 0 ? data : defaultData;

  // Find the maximum value for scaling
  const maxValue = Math.max(...displayData.map((item) => item.amount));

  // Calculate the chart area width (considering we might not be able to show all bars)
  const chartWidth = Dimensions.get("window").width - 40 - 40; // screen width - padding - padding
  const totalBarsWidth = displayData.length * (barWidth + barGap) - barGap;

  // If totalBarsWidth > chartWidth, we need to limit the number of bars
  const numBarsToShow =
    totalBarsWidth > chartWidth
      ? Math.floor(chartWidth / (barWidth + barGap))
      : displayData.length;

  // Take the most recent days (or all if they fit)
  const visibleData = displayData.slice(-numBarsToShow);

  // Generate horizontal grid lines
  const renderGridLines = () => {
    const lines = [];
    const numLines = 5;

    for (let i = 0; i < numLines; i++) {
      const linePosition = height * (i / (numLines - 1));

      lines.push(
        <View key={i} style={[styles.gridLine, { bottom: linePosition }]} />
      );
    }

    return lines;
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Daily Spending This Month</Text>
      </View>

      <View style={[styles.chartContainer, { height }]}>
        {/* Grid lines */}
        {renderGridLines()}

        {/* Bars */}
        <View style={styles.barsContainer}>
          {visibleData.map((item, index) => {
            const barHeight = (item.amount / maxValue) * height;

            return (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      width: barWidth,
                      backgroundColor: barColor,
                      borderTopLeftRadius: barRadius,
                      borderTopRightRadius: barRadius,
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendText}>Day of Month</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  chartHeader: {
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 16,
    color: "#666",
  },
  chartContainer: {
    position: "relative",
    marginBottom: 10,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: "100%",
  },
  barContainer: {
    alignItems: "center",
    marginRight: 8,
  },
  bar: {
    backgroundColor: "#6C63FF",
  },
  barLabel: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
  },
  legend: {
    alignItems: "center",
    marginTop: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#888",
  },
});

export default MonthlySpendingChart;
