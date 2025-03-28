import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Button,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    Alert,
} from "react-native";
import Modal from "react-native-modal";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
import {
    fetchUserBudgetKeys,
    fetchUserBudget,
    fetchUserTransactionsByDate,
} from "../backend/fetchData";
import { fetchSpendingPerCategoryByDate } from "../backend/analyzeMonthlySpending";
import { setBudget, addSpending, deleteTransaction, resetBudget, resetAllBudgets } from "../backend/pushData";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const getCurrentMonthDates = () => {
    const now = new Date(); // Get the current date
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
        monthStartDate: Timestamp.fromDate(startOfMonth),
        monthEndDate: Timestamp.fromDate(endOfMonth),
    };
};

export default function Statistics() {
    // user information
    const { user, loading: authLoading } = useAuth();
    const userID = user?.uid;

    const iconDict: { [key: string]: IconSymbolName } = {
        shopping: "cart.fill",
        bills: "calendar",
        food: "fork.knife",
        health: "heart.text.clipboard.fill",
    };
    const [isModalVisible, setModalVisible] = useState(false);
    const [isSpendingModalVisible, setSpendingModalVisible] = useState(false);
    const [category, setCategory] = useState("Shopping");
    const [frequency, setFrequency] = useState("Daily");
    const [amount, setAmount] = useState("");

    const [spendingCategory, setSpendingCategory] = useState("food"); //adding spending to history
    const [spendingAmount, setSpendingAmount] = useState("");
    const [spendingDescription, setSpendingDescription] = useState("");
    const [spendingDate, setSpendingDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [categoryOpen, setCategoryOpen] = useState(false);
    const [frequencyOpen, setFrequencyOpen] = useState(false);
    const [view, setView] = useState("Daily");
    const [viewOpen, setViewOpen] = useState(false);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshData, setRefreshData] = useState(false);

    const { monthStartDate, monthEndDate } = getCurrentMonthDates(); //get user's curr month to date

    const onChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setSpendingDate(selectedDate);
        }
    };

    const [isResetModalVisible, setResetModalVisible] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [isDeleteTransactionModalVisible, setDeleteTransactionModalVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const toggleResetModal = (budget = null) => {
        setSelectedBudget(budget);
        setResetModalVisible(!isResetModalVisible);
    };

    const toggleDeleteTransactionModal = (transaction = null) => {
        setSelectedTransaction(transaction);
        setDeleteTransactionModalVisible(!isDeleteTransactionModalVisible);
    };

    const handleResetBudget = async () => {
        if (!userID) return;

        try {
            if (selectedBudget) {
                // Reset specific budget
                await resetBudget(userID, selectedBudget.category);
            } else {
                // Reset all budgets
                await resetAllBudgets(userID);
            }
            
            setResetModalVisible(false);
            setRefreshData(prev => !prev);
            
            Alert.alert(
                "Success", 
                selectedBudget 
                    ? `Budget for ${selectedBudget.category} has been reset` 
                    : "All budgets have been reset"
            );
        } catch (error) {
            console.error("Error resetting budget:", error);
            Alert.alert("Error", "Failed to reset budget. Please try again.");
        }
    };

    const handleDeleteTransaction = async () => {
        if (!userID || !selectedTransaction) return;

        try {
            await deleteTransaction(userID, selectedTransaction.category, selectedTransaction.id);
            setDeleteTransactionModalVisible(false);
            setRefreshData(prev => !prev);
            
            Alert.alert("Success", "Transaction has been deleted");
        } catch (error) {
            console.error("Error deleting transaction:", error);
            Alert.alert("Error", "Failed to delete transaction. Please try again.");
        }
    };

    useEffect(() => {
        const fetchBudgets = async () => {
            if (!userID) return;
            setIsLoading(true);
            try {
                const budgetKeys = await fetchUserBudgetKeys(userID);
                const userBudgets = await fetchUserBudget(userID);
                const spendingPerCategory =
                    await fetchSpendingPerCategoryByDate(
                        userID,
                        monthStartDate,
                        monthEndDate,
                        budgetKeys //fetches current categories the user has transactions in
                    );
                console.log(
                    "from statistics, spending per category:",
                    spendingPerCategory
                );

                if (budgetKeys && userBudgets && spendingPerCategory) {
                    const newBudgets = budgetKeys.map((key) => ({
                        category: key,
                        amount: spendingPerCategory[key]?.["total"] || 0,
                        limit: userBudgets[key] || 0,
                        icon: (iconDict[key] as IconSymbolName) || "null",
                    }));

                    setBudgets(newBudgets);
                } else {
                    console.log("no budgets set");
                    setBudgets([]);
                }

                const transactions = await fetchUserTransactionsByDate(
                    userID,
                    monthStartDate,
                    monthEndDate
                );
                console.log(
                    "from statistics, total transactons:",
                    transactions.length
                );
                if (transactions) {
                    const newHistory = transactions.map((transaction) => ({
                        id: transaction.id,
                        category: transaction.category,
                        name: transaction["description"],
                        amount: transaction["amount"],
                        date: transaction["date"].toDate().toLocaleDateString(),
                    }));
                    setHistory(newHistory);
                }
            } catch (error) {
                console.error("budget retrieval failed: ", error);
                setBudgets([]);
            } finally {
                setIsLoading(false); // Set loading to false after data is fetched
            }
        };
        fetchBudgets();
    }, [userID, refreshData]);

    const handleAddSpending = async () => {
        if (!userID) {
            console.error("User is not authenticated.");
            return;
        }

        const spendingData = {
            category: spendingCategory,
            amount: parseFloat(spendingAmount),
            description: spendingDescription,
            date: Timestamp.fromDate(spendingDate),
        };

        try {
            addSpending(spendingData, userID);
            setSpendingModalVisible(false);
        } catch (error) {
            console.error("Error adding spending data:", error);
        }
        console.log({ category, frequency, amount });
        // Reset the form fields
        setSpendingAmount("");
        setSpendingCategory("");
        setSpendingDescription("");
        setSpendingDate(new Date());
        toggleSpendingModal();
        setRefreshData((prev) => !prev);
    };

    const toggleModal = () => {
        setCategoryOpen(false);
        setFrequencyOpen(false);
        setCategory("");
        setFrequency("");
        setAmount("");
        setModalVisible(!isModalVisible);
    };

    const toggleSpendingModal = () => {
        setSpendingCategory("food"); // Reset to default category
        setSpendingAmount("");
        setSpendingDescription("");
        setSpendingDate(new Date());
        setSpendingModalVisible(!isSpendingModalVisible); // Toggle only the "Add Spending" modal
    };
    if (authLoading || isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4C38CD" />
                <Text style={styles.loadingText}>Loading budgets...</Text>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.subtitle}>
                    Sign in to view your budget and spending history!
                </Text>
            </SafeAreaView>
        );
    }

    const handleAddBudget = () => {
        const budgetData = {
            category: category,
            amount: amount,
            frequency: frequency,
        };
        setBudget(budgetData, userID);
        console.log({ category, frequency, amount });
        // Reset the form fields
        setCategory("");
        setFrequency("");
        setAmount("");
        toggleModal();
        setRefreshData((prev) => !prev);
    };

    const getFilteredBudgets = () => {
        // Transform or filter budgets based on the selected view
        switch (view) {
            case "Daily":
                return budgets.map((budget) => ({
                    ...budget,
                    amount: budget.amount / 30,
                    limit: budget.limit / 30,
                }));
            case "Weekly":
                return budgets.map((budget) => ({
                    ...budget,
                    amount: budget.amount / 4,
                    limit: budget.limit / 4,
                }));
            case "Monthly":
                return budgets;
            case "Yearly":
                return budgets.map((budget) => ({
                    ...budget,
                    amount: budget.amount * 12,
                    limit: budget.limit * 12,
                }));
            default:
                return budgets;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.subtitle}>Budgets</Text>
                <View style={styles.headerButtonsContainer}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={toggleModal}
                    >
                        <IconSymbol size={28} name="plus.circle" color="#3C3ADD" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => toggleResetModal()}
                    >
                        <IconSymbol size={28} name="arrow.counterclockwise" color="#FF5757" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.expensesContainer}>
                <DropDownPicker
                    open={viewOpen}
                    value={view}
                    items={[
                        { label: "Daily", value: "Daily" },
                        { label: "Weekly", value: "Weekly" },
                        { label: "Monthly", value: "Monthly" },
                        { label: "Yearly", value: "Yearly" },
                    ]}
                    setOpen={setViewOpen}
                    setValue={setView}
                    style={styles.viewDropdown}
                    textStyle={styles.viewDropdownText}
                    dropDownContainerStyle={styles.viewDropdownContainer}
                    containerStyle={styles.viewDropdownContainerStyle}
                />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollView}
                style={styles.fixedScrollView}
            >
                {getFilteredBudgets().map((budget, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.card}
                        onLongPress={() => toggleResetModal(budget)}
                    >
                        <IconSymbol
                            size={28}
                            name={budget.icon}
                            color="#9e9ded"
                        />
                        <Text style={styles.category}>{budget.category}</Text>
                        <View style={styles.amountContainer}>
                            <Text style={styles.amount}>
                                ${budget.amount.toFixed(2)}
                            </Text>
                            <Text style={styles.limit}>
                                of ${budget.limit.toFixed(2)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            
            <View style={styles.historyHeaderContainer}>
                <Text style={[styles.subtitle, styles.historySubtitle]}>
                    History
                </Text>
                <TouchableOpacity
                    style={styles.addBudgetButton}
                    onPress={() => setSpendingModalVisible(true)}
                >
                    <IconSymbol size={28} name="plus.circle" color="#3C3ADD" />
                </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={styles.scrollViewColumn}>
                {history.map((item, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.historyCard}
                        onLongPress={() => toggleDeleteTransactionModal(item)}
                    >
                        <View style={styles.historyTextContainer}>
                            <Text style={styles.historyName}>{item.name}</Text>
                            <Text style={styles.historyDate}>{item.date}</Text>
                        </View>
                        <Text style={styles.historyAmount}>
                            ${item.amount.toFixed(2)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <Modal
                isVisible={isSpendingModalVisible}
                onBackdropPress={() => setSpendingModalVisible(false)}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Add Spending</Text>
                    <DropDownPicker
                        open={categoryOpen}
                        value={spendingCategory}
                        items={[
                            { label: "Food", value: "food" },
                            { label: "Bills", value: "bills" },
                            { label: "Health", value: "health" },
                            { label: "Shopping", value: "shopping" },
                        ]}
                        setOpen={setCategoryOpen}
                        setValue={setSpendingCategory}
                        style={styles.dropdown}
                        placeholder="Category"
                        placeholderStyle={{ color: "grey" }}
                        containerStyle={[
                            styles.dropdownContainer,
                            { zIndex: 1000 },
                        ]}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Amount"
                        placeholderTextColor="grey"
                        value={spendingAmount}
                        onChangeText={setSpendingAmount}
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Description"
                        placeholderTextColor="grey"
                        value={spendingDescription}
                        onChangeText={setSpendingDescription}
                    />
                    <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.datePickerButtonText}>
                            {spendingDate.toLocaleDateString()}
                        </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={spendingDate}
                            mode="date"
                            display="default"
                            onChange={onChange}
                        />
                    )}
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddSpending}
                    >
                        <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Add Budget</Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={toggleModal}
                    >
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
                        placeholder="Category"
                        placeholderStyle={{
                            color: "grey",
                        }}
                        containerStyle={[
                            styles.dropdownContainer,
                            { zIndex: 1000 },
                        ]} // Ensure the dropdown is on top
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
                        placeholder="Frequency"
                        placeholderStyle={{
                            color: "grey",
                        }}
                        containerStyle={[
                            styles.dropdownContainer,
                            { zIndex: 500 },
                        ]}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Amount"
                        placeholderTextColor="grey"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                    />
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddBudget}
                    >
                        <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            <Modal
                isVisible={isResetModalVisible}
                onBackdropPress={() => setResetModalVisible(false)}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                        {selectedBudget 
                            ? `Reset ${selectedBudget.category} Budget` 
                            : "Reset All Budgets"}
                    </Text>
                    <Text style={styles.modalText}>
                        {selectedBudget 
                            ? `Are you sure you want to reset the budget for ${selectedBudget.category}?` 
                            : "Are you sure you want to reset all budgets? This will set all budget amounts to zero."}
                    </Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => setResetModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.resetButton]}
                            onPress={handleResetBudget}
                        >
                            <Text style={styles.buttonText}>Reset</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
                isVisible={isDeleteTransactionModalVisible}
                onBackdropPress={() => setDeleteTransactionModalVisible(false)}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Delete Transaction</Text>
                    <Text style={styles.modalText}>
                        Are you sure you want to delete this transaction?
                        {selectedTransaction && `\n\n${selectedTransaction.name}: $${selectedTransaction.amount.toFixed(2)}`}
                    </Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => setDeleteTransactionModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.deleteButton]}
                            onPress={handleDeleteTransaction}
                        >
                            <Text style={styles.buttonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 70,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    
    headerButtonsContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    
    headerButton: {
        marginLeft: 10,
        padding: 5,
    },
    
    expensesContainer: {
        marginTop: 0, // Reduced top margin
        marginBottom: 0, // Reduced bottom margin
        alignItems: "center",
    },
    
    viewDropdown: {
        borderWidth: 0,
        backgroundColor: "transparent",
        paddingRight: 45,
        marginLeft: 24,
    },
    
    viewDropdownText: {
        color: "#3C3ADD",
        fontWeight: "bold",
        textAlign: "left",
    },
    
    viewDropdownContainer: {
        borderWidth: 0,
    },
    
    viewDropdownContainerStyle: {
        width: 150,
    },
    
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        padding: 16,
        paddingHorizontal: 16,
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
        marginVertical: 5, // Reduce vertical margin
        paddingHorizontal: 16,
    },
    historySubtitle: {
        marginTop: 0, // Remove top margin
    },
    scrollView: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        marginBottom: 0, // Remove bottom margin completely
        paddingBottom: 0, // Ensure no padding at the bottom
        maxHeight: "60%", // Limit the height to prevent excessive expansion
    },
    fixedScrollView: {
        maxHeight: "60%", // Limit the ScrollView height
    },
    card: {
        backgroundColor: "#f8f7fc",
        width: "48%",
        aspectRatio: 1,
        borderRadius: 8,
        padding: 8,
        marginVertical: 5, // Reduce vertical margin of cards
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
        color: "#939393",
        marginVertical: 2,
    },
    historyHeaderContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginTop: 0, // Remove top margin
        marginBottom: 5,
        paddingTop: 0, // Ensure no top padding
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
    label: {
        color: "#333", // Darker color for the label
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        width: "100%",
        height: 50,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: "#ccc",
        marginBottom: 10,
        borderRadius: 5,
        width: "100%",
    },
    dropdownContainer: {
        marginBottom: 10,
        width: "100%",
        height: 60,
    },
    closeButton: {
        position: "absolute",
        top: 20,
        right: 20,
    },
    addBudgetButton: {
        alignSelf: "center",
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
    viewDropdown: {
        borderWidth: 0,
        backgroundColor: "transparent",
        paddingRight: 45,
        marginLeft: 24,
    },
    viewDropdownText: {
        color: "#3C3ADD",
        fontWeight: "bold",
        textAlign: "left",
    },
    viewDropdownContainer: {
        borderWidth: 0,
    },
    viewDropdownContainerStyle: {
        width: 150,
    },
    amountContainer: {
        alignItems: "center",
        color: "#939393",
        fontSize: 14,
        marginVertical: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#666",
    },
    datePickerButton: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        alignItems: "center",
    },
    datePickerButtonText: {
        color: "#000",
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#E0E0E0',
    },
    resetButton: {
        backgroundColor: '#FF5757',
    },
    deleteButton: {
        backgroundColor: '#FF5757',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
});
