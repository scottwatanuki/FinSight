import React, { useState } from "react";
import { Text, View, ScrollView, TouchableOpacity, TextInput, Button, StyleSheet } from "react-native";
import Modal from "react-native-modal";
import DropDownPicker from "react-native-dropdown-picker";
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';

const budgets = [
  { category: "Shopping", amount: 112.38, limit: 200, icon: "cart.fill" as IconSymbolName },
  { category: "Bills", amount: 1082.11, limit: 3000, icon: "calendar" as IconSymbolName },
  { category: "Food", amount: 98.04, limit: 200, icon: "fork.knife" as IconSymbolName },
  { category: "Health", amount: 52.76, limit: 100, icon: "heart.text.clipboard.fill" as IconSymbolName },
  { category: "Shopping", amount: 112.38, limit: 200, icon: "cart.fill" as IconSymbolName },
  { category: "Bills", amount: 1082.11, limit: 3000, icon: "calendar" as IconSymbolName },
  { category: "Food", amount: 98.04, limit: 200, icon: "fork.knife" as IconSymbolName },
  { category: "Health", amount: 52.76, limit: 100, icon: "heart.text.clipboard.fill" as IconSymbolName },
];

const history = [
    { name: "Chick-fil-a", amount: 12.58, date: "February 10, 2025" },
    { name: "Nike", amount: 87.09, date: "February 8, 2025" },
    { name: "Sephora", amount: 34.16, date: "February 7, 2025" },
    { name: "Amazon", amount: 45.12, date: "February 5, 2025" },
    { name: "Salad Bar", amount: 9.99, date: "February 4, 2025" },
    { name: "Walmart", amount: 23.45, date: "February 3, 2025" },
];

export default function Statistics() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState("Shopping");
  const [frequency, setFrequency] = useState("Daily");
  const [amount, setAmount] = useState("");

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [frequencyOpen, setFrequencyOpen] = useState(false);

  const toggleModal = () => {
    setCategoryOpen(false);
    setFrequencyOpen(false);
    setModalVisible(!isModalVisible);
  };

  const handleAddBudget = () => {
    // Handle adding the budget here
    console.log({ category, frequency, amount });
    // Reset the form fields
    setCategory("");
    setFrequency("");
    setAmount("");
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

      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal} >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Budget</Text>
          <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
            <IconSymbol size={20} name="xmark" color="#000" />
          </TouchableOpacity>
          <DropDownPicker
            open={categoryOpen}
            value={category}
            items={[
              { label: "Shopping", value: "Shopping" },
              { label: "Bills", value: "Bills" },
              { label: "Food", value: "Food" },
              { label: "Health", value: "Health" },
            ]}
            setOpen={setCategoryOpen}
            setValue={setCategory}
            style={styles.dropdown}
            containerStyle={[styles.dropdownContainer, { zIndex: 1000 }]} // Ensure the dropdown is on top
          />
          <DropDownPicker
            open={frequencyOpen}
            value={frequency}
            items={[
              { label: "Daily", value: "Daily" },
              { label: "Weekly", value: "Weekly" },
              { label: "Monthly", value: "Monthly" },
              { label: "Yearly", value: "Yearly" },
            ]}
            setOpen={setFrequencyOpen}
            setValue={setFrequency}
            style={styles.dropdown}
            containerStyle={[styles.dropdownContainer, { zIndex: 500 }]} // Ensure the dropdown is on top
          />
          <TextInput
            style={styles.input}
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddBudget}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
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
        overflow: "hidden",
      },
      budgetsContainer: {
        maxHeight: 200, // Set a fixed height for the budgets container
        overflow: "hidden",
      },
      historyContainer: {
        maxHeight: 200, // Set a fixed height for the history container
        overflow: "hidden",
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
            justifyContent: "center",
            textAlign: "center",
        },
        input: {
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            marginBottom: 10,
            borderRadius: 5,
            width: '100%',
            height: 50,
        },
        dropdown: {
            borderWidth: 1,
            borderColor: "#ccc",
            marginBottom: 10,
            borderRadius: 5,
            width: '100%',
            
          },
          dropdownContainer: {
            marginBottom: 10,
            width: '100%',
            height: 60,
          },
          closeButton: {
            position: "absolute",
            top: 20,
            right: 20,
          },
          addButton: {
            backgroundColor: "#3C3ADD",
            borderWidth: 1,
            borderColor: "#3C3ADD",
            borderRadius: 8,
            marginTop: 30,
            padding: 13,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
            width: 200,
            alignSelf: "center",
            
          },
          addButtonText: {
            color: "#fff",
            fontWeight: "bold",
            fontSize: 18,
          },
});