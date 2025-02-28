import React, { useState } from "react";
import { Text, View, ScrollView, TouchableOpacity, TextInput, Button, StyleSheet } from "react-native";
import Modal from "react-native-modal";
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
  const [isModalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("");
  const [amount, setAmount] = useState("");

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleAddBudget = () => {
    // Handle adding the budget here
    console.log({ category, frequency, amount });
    toggleModal();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Budgets</Text>
        <TouchableOpacity onPress={toggleModal}>
          <IconSymbol size={28} name="plus.circle" color="#3C3ADD" />
        </TouchableOpacity>
      </View>
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
      <Text style={[styles.subtitle, styles.historySubtitle]}>History</Text>
      <ScrollView contentContainerStyle={styles.scrollViewColumn}>
        {history.map((item, index) => (
          <View key={index} style={styles.historyCard}>
            <View style={styles.historyTextContainer}>
              <Text style={styles.historyName}>{item.name}</Text>
              <Text style={styles.historyDate}>{item.date}</Text>
            </View>
            <Text style={styles.historyAmount}>${item.amount}</Text>
          </View>
        ))}
      </ScrollView>
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Budget</Text>
          <TextInput
            style={styles.input}
            placeholder="Category"
            value={category}
            onChangeText={setCategory}
          />
          <TextInput
            style={styles.input}
            placeholder="Frequency"
            value={frequency}
            onChangeText={setFrequency}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Button title="Add" onPress={handleAddBudget} />
          <Button title="Cancel" onPress={toggleModal} color="red" />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        padding: 16,
        paddingHorizontal: 16,
      },
      scrollViewColumn: {
        flexDirection: "column",
        paddingHorizontal: 16,
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
        paddingHorizontal: 16,
      },
      historySubtitle: {
          marginTop: 16, // Reduce the top margin to make the space less
      },
      scrollView: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 8,
        maxHeight: 460,
        paddingHorizontal: 16,
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
        fontWeight: "normal", 
      },
      historyCard: {
          backgroundColor: "#ffffff",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          marginVertical: 8,
          borderRadius: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        },
        historyTextContainer: {
          flexDirection: "column",
        },
        historyName: {
          fontSize: 18,
          fontWeight: "bold",
        },
        historyDate: {
          fontSize: 14,
          color: "#939393",
        },
        historyAmount: {
          fontSize: 20,
          fontWeight: "bold",
        },
        modalContent: {
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 20,
        },
        input: {
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            marginBottom: 10,
            borderRadius: 5,
        },
});