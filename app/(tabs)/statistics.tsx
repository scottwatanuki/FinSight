import React from "react";
import { Text, View, ScrollView, StyleSheet } from "react-native";
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';

const budgets = [
    { category: "Shopping", amount: 112.38, limit: 200, icon: "cart.fill" as IconSymbolName },
    { category: "Bills", amount: 1082.11, limit: 3000, icon: "calendar" as IconSymbolName },
    { category: "Food", amount: 98.04, limit: 200, icon: "fork.knife" as IconSymbolName },
    { category: "Health", amount: 52.76, limit: 100, icon: "heart.text.clipboard.fill" as IconSymbolName },
  ];
  
  const history = [
    { name: "Chick-fil-a", amount: 12.58, date: "February 10, 2025" },
    { name: "Nike", amount: 87.09, date: "February 8, 2025" },
    { name: "Sephora", amount: 34.16, date: "February 7, 2025" },
  ];
  
  export default function Statistics() {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>Budgets</Text>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {budgets.map((budget, index) => (
            <View key={index} style={styles.card}>
              <IconSymbol size={28} name={budget.icon} color="#9e9ded" />
              <Text style={styles.category}>{budget.category}</Text>
              <Text style={styles.amount}>
                ${budget.amount}
                <Text style={styles.limit}> of ${budget.limit}</Text>
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#ffffff",
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      marginVertical: 8,
    },
    subtitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginVertical: 8,
    },
    scrollView: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    card: {
      backgroundColor: "#f8f7fc",
      width: "48%",
      aspectRatio: 1,
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    category: {
      fontSize: 16,
      fontWeight: "bold",
      marginVertical: 4,
    },
    amount: {
        color: "#939393",
      fontSize: 14,
      marginVertical: 2,
      fontWeight: "bold",
    },
    limit: {
      fontSize: 14,
      fontWeight: "normal", // Ensure the limit text is not bold
    },
  });