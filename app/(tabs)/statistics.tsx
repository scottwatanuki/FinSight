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
import {
    fetchSpendingPerCategoryByDate,
    monthlyMedianSpending,
} from "../backend/analyzeMonthlySpending";
import {
    setBudget,
    addSpending,
    deleteTransaction,
    resetBudget,
    resetAllBudgets,
} from "../backend/pushData";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { logButtonClick, logViewChange } from "../../firebaseWrapper";

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
        entertainment: "film.fill",
        travel: "airplane",
        bills: "calendar",
        groceries: "cart.fill",
        dining: "fork.knife",
        subscriptions: "newspaper.fill",
        transportation: "car.fill",
        recreational: "gamecontroller.fill",
        shopping: "bag.fill",
        health: "heart.fill",
        misc: "ellipsis",
    };
    const [isModalVisible, setModalVisible] = useState(false);
    const [isSpendingModalVisible, setSpendingModalVisible] = useState(false);
    const [category, setCategory] = useState("");
    const [frequency, setFrequency] = useState("");
    const [amount, setAmount] = useState("");

    const [spendingCategory, setSpendingCategory] = useState(""); //adding spending to history
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
    const [predictedMonthlySpending, setPredictedMonthlySpending] =
        useState(null);
    const [filterCategory, setFilterCategory] = useState(null); // State for selected filter category
    const [filterOpen, setFilterOpen] = useState(false);

    const { monthStartDate, monthEndDate } = getCurrentMonthDates(); //get user's curr month to date

    const onChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setSpendingDate(selectedDate);
        }
    };

    const handleViewChange = (newView: string) => {
        setView(newView);
        logViewChange(newView);
    };

    const [isResetModalVisible, setResetModalVisible] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [isDeleteTransactionModalVisible, setDeleteTransactionModalVisible] =
        useState(false);
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
            setRefreshData((prev) => !prev);

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
            await deleteTransaction(
                userID,
                selectedTransaction.category,
                selectedTransaction.id
            );
            setDeleteTransactionModalVisible(false);
            setRefreshData((prev) => !prev);

            Alert.alert("Success", "Transaction has been deleted");
        } catch (error) {
            console.error("Error deleting transaction:", error);
            Alert.alert(
                "Error",
                "Failed to delete transaction. Please try again."
            );
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
                if (budgetKeys && userBudgets && spendingPerCategory) {
                    // console.log(
                    //     "All required data exists, proceeding with mapping"
                    // );
                    const newBudgets = budgetKeys.map((key) => {
                        return {
                            category: key,
                            amount: spendingPerCategory[key]?.["total"] || 0,
                            limit: userBudgets[key]["amount"] || 0,
                            frequency: userBudgets[key]["frequency"] || "null",
                            icon: (iconDict[key] as IconSymbolName) || "null",
                        };
                    });
                    setBudgets(newBudgets);
                } else {
                    // console.log("no budgets set");
                    setBudgets([]);
                }
                // console.log("new budget", budgets);
                // console.log("the date:", monthEndDate);
                const fetchPredictedSpending = async () => {
                    try {
                        const fetchedData = await monthlyMedianSpending(userID);
                        setPredictedMonthlySpending(fetchedData);
                    } catch (error) {
                        console.error(
                            "Error fetching predicted spending data:",
                            error
                        );
                    } finally {
                        setIsLoading(false); // Set loading to false
                    }
                };

                fetchPredictedSpending();
                const predictedMonthlySpending = await monthlyMedianSpending(
                    userID
                );
                // console.log(
                //     "predicted spending amount",
                //     predictedMonthlySpending
                // );
                // console.log(
                //     "Date range:",
                //     monthStartDate.toDate(),
                //     "-",
                //     monthEndDate.toDate()
                // );
                // console.log("Today's date:", new Date());
                const transactions = await fetchUserTransactionsByDate(
                    userID,
                    monthStartDate,
                    monthEndDate,
                    budgetKeys
                );
                // console.log("transactions inside DB:", transactions);
                // console.log(
                //     "from statistics, total transactons:",
                //     transactions.length
                // );
                if (transactions) {
                    const newHistory = transactions.map((transaction) => ({
                        id: transaction.id,
                        category: transaction.category,
                        name: transaction["description"],
                        amount: transaction["amount"],
                        date: transaction["date"].toDate().toLocaleDateString(),
                    }));
                    setHistory(newHistory);
                    // console.log("updated history:", history);
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
        // console.log("added spending data");
        // Reset the form fields
        setSpendingAmount("");
        setSpendingCategory("");
        setSpendingDescription("");
        setSpendingDate(new Date());
        // toggleSpendingModal();
        setRefreshData((prev) => !prev);
        // console.log("refreshing");
    };

    const toggleModal = () => {
        setCategoryOpen(false);
        setFrequencyOpen(false);
        setCategory("");
        setFrequency("");
        setAmount("");
        setModalVisible(!isModalVisible);
    };

    const filterTransactions = (transactions, category) => {
        return transactions.filter((transaction) => {
            return transaction.category == category;
        });
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

    const getFilteredHistory = () => {
        if (!filterCategory) {
            return history; // If no category is selected, return all items
        }
        return history.filter((item) => item.category === filterCategory);
    };

    const handleAddBudget = async () => {
        const budgetData = {
            category: category,
            amount: amount,
            frequency: frequency,
        };
        setBudget(budgetData, userID);
        // console.log({ category, frequency, amount });
        // Reset the form fields
        setCategory("");
        setFrequency("");
        setAmount("");
        toggleModal();
        setRefreshData((prev) => !prev);
        await logButtonClick("add_budget");
    };

    const getFilteredBudgets = () => {
        // Transform or filter budgets based on the selected view
        switch (view) {
            case "Daily":
                return budgets.map((budget) => {
                    if (budget.frequency === "Daily") {
                        return {
                            ...budget,
                            amount: budget.amount,
                            limit: budget.limit,
                        };
                    } else if (budget.frequency === "Weekly") {
                        return {
                            ...budget,
                            amount: budget.amount / 7,
                            limit: budget.limit / 7,
                        };
                    } else if (budget.frequency === "Monthly") {
                        return {
                            ...budget,
                            amount: budget.amount / 30,
                            limit: budget.limit / 30,
                        };
                    } else {
                        // Yearly budget
                        return {
                            ...budget,
                            amount: budget.amount / 365,
                            limit: budget.limit / 365,
                        };
                    }
                });
            case "Weekly":
                return budgets.map((budget) => {
                    if (budget.frequency === "Daily") {
                        return {
                            ...budget,
                            amount: budget.amount * 7,
                            limit: budget.limit * 7,
                        };
                    } else if (budget.frequency === "Weekly") {
                        return {
                            ...budget,
                            amount: budget.amount,
                            limit: budget.limit,
                        };
                    } else if (budget.frequency === "Monthly") {
                        return {
                            ...budget,
                            amount: budget.amount / 4,
                            limit: budget.limit / 4,
                        };
                    } else {
                        // Yearly budget
                        return {
                            ...budget,
                            amount: budget.amount / 52,
                            limit: budget.limit / 52,
                        };
                    }
                });
            case "Monthly":
                return budgets.map((budget) => {
                    if (budget.frequency === "Daily") {
                        return {
                            ...budget,
                            amount: budget.amount / 30,
                            limit: budget.limit / 30,
                        };
                    } else if (budget.frequency === "Weekly") {
                        return {
                            ...budget,
                            amount: budget.amount / 4,
                            limit: budget.limit / 4,
                        };
                    } else if (budget.frequency === "Monthly") {
                        return {
                            ...budget,
                            amount: budget.amount,
                            limit: budget.limit,
                        };
                    } else {
                        // Yearly budget
                        return {
                            ...budget,
                            amount: budget.amount * 12,
                            limit: budget.limit * 12,
                        };
                    }
                });
            case "Yearly":
                return budgets.map((budget) => {
                    if (budget.frequency === "Daily") {
                        return {
                            ...budget,
                            amount: budget.amount / 365,
                            limit: budget.limit / 365,
                        };
                    } else if (budget.frequency === "Weekly") {
                        return {
                            ...budget,
                            amount: budget.amount / 52,
                            limit: budget.limit / 52,
                        };
                    } else if (budget.frequency === "Monthly") {
                        return {
                            ...budget,
                            amount: budget.amount / 12,
                            limit: budget.limit / 12,
                        };
                    } else {
                        // Yearly budget
                        return {
                            ...budget,
                            amount: budget.amount,
                            limit: budget.limit,
                        };
                    }
                });
            default:
                return budgets;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.subtitle}>Budgets</Text>
                {/* <TouchableOpacity
                    style={styles.headerButton}
                    onPress={toggleModal}
                >
                    <IconSymbol
                        size={28}
                        name="pencil.circle"
                        color="#3C3ADD"
                    />
                </TouchableOpacity> */}
                <View style={styles.headerButtonsContainer}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={toggleModal}
                    >
                        <IconSymbol
                            size={28}
                            name="plus.circle"
                            color="#3C3ADD"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => toggleResetModal()}
                    >
                        <IconSymbol
                            size={28}
                            name="arrow.counterclockwise"
                            color="#FF5757"
                        />
                    </TouchableOpacity>
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
                        setValue={handleViewChange}
                        style={styles.viewDropdown}
                        textStyle={styles.viewDropdownText}
                        dropDownContainerStyle={styles.viewDropdownContainer}
                        containerStyle={styles.viewDropdownContainerStyle}
                    />
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollView}
                style={styles.fixedScrollView}
            >
                {getFilteredBudgets().length > 0 ? (
                    getFilteredBudgets().map((budget, index) => (
                        // <View key={index} style={styles.card}>
                        <TouchableOpacity
                            // key={index}
                            key={`${budget.category}-${budget.amount}-${index}`}
                            style={styles.card}
                            onLongPress={() => toggleResetModal(budget)}
                        >
                            <IconSymbol
                                size={28}
                                name={budget.icon}
                                color="#9e9ded"
                            />
                            <Text style={styles.category}>
                                {budget.category}
                            </Text>
                            <View style={styles.amountContainer}>
                                <Text style={styles.limit}>
                                    ${budget.amount.toFixed(2)} spent of
                                </Text>
                                <Text style={styles.amount}>
                                    ${budget.limit.toFixed(2)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.noBudgetsText}>
                        Add Your Budgets To Get Started!
                    </Text>
                )}
            </ScrollView>

            <View style={styles.historyHeaderContainer}>
                <Text style={styles.historySubtitle}>History</Text>

                <TouchableOpacity
                    style={styles.addBudgetButton}
                    onPress={() => setSpendingModalVisible(true)}
                >
                    <IconSymbol size={28} name="plus.circle" color="#3C3ADD" />
                </TouchableOpacity>
                <DropDownPicker
                    open={filterOpen}
                    value={filterCategory}
                    items={[
                        { label: "All Categories", value: null },
                        { label: "Entertainment", value: "entertainment" },
                        { label: "Travel", value: "travel" },
                        { label: "Bills", value: "bills" },
                        { label: "Groceries", value: "groceries" },
                        { label: "Dining", value: "dining" },
                        { label: "Subscriptions", value: "subscriptions" },
                        { label: "Transportation", value: "transportation" },
                        { label: "Recreational", value: "recreational" },
                        { label: "Shopping", value: "shopping" },
                        { label: "Health", value: "health" },
                        { label: "Misc", value: "misc" },
                    ]}
                    setOpen={setFilterOpen}
                    setValue={setFilterCategory}
                    placeholder="All Categories"
                    style={styles.filterDropdown}
                    textStyle={styles.filterDropdownText}
                    dropDownContainerStyle={styles.filterDropdownContainer}
                />
            </View>

            <ScrollView
                style={styles.scrollViewColumn}
                contentContainerStyle={{ flexGrow: 1 }} // Ensures content can grow beyond the fixed height
                showsVerticalScrollIndicator={true}
            >
                {getFilteredHistory().map((item) => (
                    // <View key={item.id} style={{ marginBottom: 16 }}>
                    <View
                        key={`${item.id}-${item.date}-${item.amount}`}
                        style={{ marginBottom: 16 }}
                    >
                        <TouchableOpacity
                            style={styles.historyCard}
                            onLongPress={() =>
                                toggleDeleteTransactionModal(item)
                            }
                        >
                            <View style={styles.historyTextContainer}>
                                <Text style={styles.historyName}>
                                    {item.name}
                                </Text>
                                <Text style={styles.historyDate}>
                                    {item.date}
                                </Text>
                                <Text style={styles.historyCategory}>
                                    {item.category}
                                </Text>
                            </View>
                            <Text style={styles.historyAmount}>
                                ${item.amount.toFixed(2)}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
            <Modal
                isVisible={isSpendingModalVisible}
                onBackdropPress={() => setSpendingModalVisible(false)}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Add Expense</Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setSpendingModalVisible(false)}
                    >
                        <IconSymbol size={20} name="xmark" color="#000" />
                    </TouchableOpacity>
                    <DropDownPicker
                        open={categoryOpen}
                        value={spendingCategory}
                        items={[
                            { label: "Entertainment", value: "entertainment" },
                            { label: "Travel", value: "travel" },
                            { label: "Bills", value: "bills" },
                            { label: "Groceries", value: "groceries" },
                            { label: "Dining", value: "dining" },
                            { label: "Subscriptions", value: "subscriptions" },
                            {
                                label: "Transportation",
                                value: "transportation",
                            },
                            { label: "Recreational", value: "recreational" },
                            { label: "Shopping", value: "shopping" },
                            { label: "Health", value: "health" },
                            { label: "Misc", value: "misc" },
                        ]}
                        setOpen={setCategoryOpen}
                        setValue={setSpendingCategory}
                        style={styles.input}
                        placeholder="Category"
                        placeholderStyle={{ color: "grey" }}
                        containerStyle={[{ zIndex: 1000 }]}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Amount"
                        placeholderTextColor="grey"
                        value={spendingAmount}
                        onChangeText={setSpendingAmount}
                        keyboardType="numeric"
                        returnKeyType="done"
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

                        {showDatePicker && (
                            <DateTimePicker
                                value={spendingDate}
                                mode="date"
                                display="default"
                                onChange={onChange}
                            />
                        )}
                    </TouchableOpacity>
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
                    <Text style={styles.modalTitle}>Add/Edit Budget</Text>
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
                            { label: "Entertainment", value: "entertainment" },
                            { label: "Travel", value: "travel" },
                            { label: "Bills", value: "bills" },
                            { label: "Groceries", value: "groceries" },
                            { label: "Dining", value: "dining" },
                            { label: "Subscriptions", value: "subscriptions" },
                            {
                                label: "Transportation",
                                value: "transportation",
                            },
                            { label: "Recreational", value: "recreational" },
                            { label: "Shopping", value: "shopping" },
                            { label: "Health", value: "health" },
                            { label: "Misc", value: "misc" },
                        ]}
                        setOpen={setCategoryOpen}
                        setValue={(value) => {
                            setCategory(value); // Update the category state
                        }}
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
                        returnKeyType="done"
                    />
                    <Text style={styles.budgetPredictionText}>
                        {predictedMonthlySpending?.[category]?.predictedAmount
                            ? `Predicted spending for ${category}:\n $${predictedMonthlySpending[
                                  category
                              ].predictedAmount.toFixed(2)}`
                            : ""}
                    </Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddBudget}
                    >
                        <Text style={styles.addButtonText}>Done</Text>
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
                            : "Are you sure you want to reset all budgets?\n This will set all budget amounts to zero."}
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
                        {selectedTransaction &&
                            `\n\n${
                                selectedTransaction.name
                            }: $${selectedTransaction.amount.toFixed(2)}`}
                    </Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() =>
                                setDeleteTransactionModalVisible(false)
                            }
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
        justifyContent: "space-between",
        alignItems: "right",
        width: 30,
        marginLeft: 30,
    },

    headerButton: {
        marginLeft: -35,
        padding: 0,
    },

    expensesContainer: {
        marginTop: 0, // Reduced top margin
        marginBottom: 0, // Reduced bottom margin
        alignItems: "center",
    },
    budgetsDropdown: {
        marginLeft: 10,
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
        height: 600,
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
        paddingLeft: -4,
    },
    historySubtitle: {
        fontSize: 24,
        fontWeight: "bold",
        paddingHorizontal: 16,
        marginLeft: -14,
    },
    scrollView: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        height: 800,
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
        fontSize: 24,
        fontWeight: "bold",
        paddingHorizontal: 16,
    },
    historyCard: {
        backgroundColor: "#ffffff",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        marginTop: 4,
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
        fontSize: 22,
        fontWeight: "bold",
        color: "#4C38CD",
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
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "transparent",
        maxWidth: 115,
        marginBottom: 10,
        marginLeft: 35,
    },
    viewDropdownText: {
        color: "#3C3ADD",
        fontWeight: "bold",
    },
    viewDropdownContainer: {
        borderWidth: 1,
        borderColor: "#ccc",
        maxWidth: 115,
        marginLeft: 35,
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
    filterDropdown: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 16,
        maxWidth: 170,
        marginLeft: 30,
        marginTop: 15,
        marginRight: 200,
    },
    filterDropdownText: {
        fontSize: 14,
        color: "#3C3ADD",
        fontWeight: "bold",
    },
    filterDropdownContainer: {
        borderWidth: 1,
        borderColor: "#ccc",
        marginLeft: 30,
        marginTop: 15,
        maxWidth: 170,
    },
    historyCategory: {
        fontSize: 14,
        color: "#3C3ADD",
        fontWeight: "bold",
    },
    noBudgetsText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#939393",
        textAlign: "center",
        marginTop: 20,
    },
    budgetPredictionText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#3C3ADD",
        textAlign: "center",
        marginTop: 15,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
        lineHeight: 22,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    button: {
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#E0E0E0",
    },
    resetButton: {
        backgroundColor: "#FF5757",
    },
    deleteButton: {
        backgroundColor: "#FF5757",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
    },
});
