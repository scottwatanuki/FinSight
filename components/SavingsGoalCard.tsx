// app/components/SavingsGoalCard.jsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const SavingsGoalCard = ({
  title = "New Car",
  currentAmount = 3500,
  targetAmount = 15000,
  deadline = "Dec 2023",
  onPress,
}) => {
  // Calculate progress percentage
  const progressPercentage = (currentAmount / targetAmount) * 100;

  // Calculate formatted amounts
  const formattedCurrent = currentAmount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formattedTarget = targetAmount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.deadline}>Goal by {deadline}</Text>
        </View>
        <Feather name="chevron-right" size={24} color="#CCCCCC" />
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.currentAmount}>{formattedCurrent}</Text>
        <Text style={styles.targetAmount}>of {formattedTarget}</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[styles.progressBar, { width: `${progressPercentage}%` }]}
          />
        </View>
        <Text style={styles.progressPercentage}>
          {Math.round(progressPercentage)}%
        </Text>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.addFundsButton}>
          <Feather name="plus" size={16} color="white" />
          <Text style={styles.addFundsText}>Add Funds</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  deadline: {
    fontSize: 14,
    color: "#888",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  currentAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4C38CD",
    marginRight: 5,
  },
  targetAmount: {
    fontSize: 16,
    color: "#888",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    marginRight: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4C38CD",
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4C38CD",
    width: 40,
    textAlign: "right",
  },
  actionContainer: {
    alignItems: "flex-start",
  },
  addFundsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4C38CD",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addFundsText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 5,
  },
});

export default SavingsGoalCard;
