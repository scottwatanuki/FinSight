// app/components/RecentTransactions.jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const RecentTransactions = ({ transactions = [], onViewAll }) => {
  // Format the date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      food: "coffee",
      shopping: "shopping-bag",
      bills: "home",
      health: "activity",
      transportation: "truck",
      entertainment: "film",
      other: "grid",
    };

    return icons[category.toLowerCase()] || "tag";
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      food: "#4CAF50",
      shopping: "#FF8A65",
      bills: "#6C63FF",
      health: "#42A5F5",
      transportation: "#FFC107",
      entertainment: "#E91E63",
      other: "#607D8B",
    };

    return colors[category.toLowerCase()] || "#607D8B";
  };

  // Show placeholder if no transactions
  if (!transactions || transactions.length === 0) {
    // Create some placeholder transactions
    transactions = [
      {
        id: "1",
        description: "Grocery Store",
        amount: 78.5,
        date: "2023-03-10",
        category: "food",
      },
      {
        id: "2",
        description: "Electric Bill",
        amount: 142.75,
        date: "2023-03-08",
        category: "bills",
      },
      {
        id: "3",
        description: "Pharmacy",
        amount: 24.99,
        date: "2023-03-07",
        category: "health",
      },
    ];
  }

  // Only show the 3 most recent transactions
  const recentTransactions = transactions.slice(0, 3);

  const renderItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getCategoryColor(item.category) + "20" },
        ]}
      >
        <Feather
          name={getCategoryIcon(item.category)}
          size={20}
          color={getCategoryColor(item.category)}
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{item.description}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.transactionAmount}>-${item.amount.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Transactions</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={recentTransactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
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
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: "#888",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF4444",
  },
});

export default RecentTransactions;
