import React, { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    FlatList,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Animated,
    Dimensions,
    Pressable,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
    doc,
    getDoc,
    collection,
    onSnapshot,
    query,
    where,
    Timestamp,
    DocumentData,
} from "firebase/firestore";
import { db } from "../../firebase";
import DropDownPicker from "react-native-dropdown-picker";
import { useFocusEffect } from "@react-navigation/native";
import {
    fetchSpendingDataByPeriod,
    fetchUserGoals,
    fetchGoalByID,
} from "../backend/fetchData";
import { addGoal } from "../backend/pushData";

import CircularProgress from "../../components/CircularProgress";
import SpendingBarChart from "../../components/SpendingBarChart";
import MonthlySpendingChart from "../../components/MonthlySpendingChart";
import SavingsGoalCard from "../components/SavingsGoalCard";
import FinancialInsightsCard from "../../components/FinancialInsightsCard";
import { useSpendingData } from "../../hooks/useSpendingData";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

// Define interfaces for better type safety
interface UserGoal {
    id: string;
    goalName: string;
    currentAmount: number;
    targetAmount: number;
    deadline?: string;
    deadlineTimestamp?: number;
    isCompleted: boolean;
}

interface SpendingDataState {
    loading: boolean;
    data: any | null;
    error: Error | null;
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 80,
    },
    header: {
        alignItems: "center",
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
    },
    greetingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 15,
    },

    greetingTextContainer: {
        flex: 1,
    },
    greetingText: {
        fontSize: 24,
        fontWeight: "700",
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5FF",
        position: "relative",
    },
    notificationBadge: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#FF5757",
        justifyContent: "center",
        alignItems: "center",
    },
    notificationBadgeText: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
    },
    expensesContainer: {
        marginTop: 10,
        marginBottom: 30,
        alignItems: "center",
    },
    viewDropdown: {
        borderWidth: 1,
        backgroundColor: "transparent",
        borderColor: "#E0E0E0",
        marginBottom: 20,
    },

    viewDropdownText: {
        color: "#3C3ADD",
        fontWeight: "bold",
        textAlign: "left",
    },

    viewDropdownContainer: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },

    viewDropdownContainerStyle: {
        width: 150,
    },
    periodSelector: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
    },
    periodSelectorText: {
        fontSize: 16,
        fontWeight: "600",
        marginRight: 5,
        color: "#4C38CD",
    },
    loadingContainer: {
        height: 240,
        justifyContent: "center",
        alignItems: "center",
    },
    expensesLabel: {
        fontSize: 18,
        color: "#888",
        marginBottom: 5,
    },
    expensesAmount: {
        fontSize: 36,
        fontWeight: "bold",
        marginBottom: 5,
    },
    expensesMax: {
        fontSize: 14,
        color: "#888",
    },
    periodTabs: {
        flexDirection: "row",
        marginTop: 10,
    },
    periodTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginHorizontal: 5,
    },
    periodTabActive: {
        backgroundColor: "#6C63FF",
    },
    periodTabText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    periodTabTextActive: {
        color: "white",
    },
    trendsSectionContainer: {
        marginVertical: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    chartContainer: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 15,
    },
    chartTitle: {
        fontSize: 16,
        color: "#888",
        marginBottom: 20,
    },
    loadingChartContainer: {
        height: 180,
        justifyContent: "center",
        alignItems: "center",
    },
    paginationDots: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#ddd",
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: "#6C63FF",
    },
    pieChartPlaceholder: {
        height: 180,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F8FF",
        borderRadius: 10,
    },
    pieChartText: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    pieChartSubtext: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: "center",
    },
    noGoalsContainer: {
        backgroundColor: "#F8F8FF",
        borderRadius: 15,
        padding: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    noGoalsText: {
        fontSize: 16,
        color: "#666",
        marginBottom: 20,
        textAlign: "center",
    },
    addGoalButton: {
        backgroundColor: "#4C38CD",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
    },
    addGoalButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    floatingAddButton: {
        position: "relative",
        alignSelf: "center",
        marginTop: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#4C38CD",
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    centeredView: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalView: {
        width: "100%",
        backgroundColor: "white",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 30,
        paddingTop: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: "90%",
    },
    modalDragHandle: {
        width: 40,
        height: 5,
        backgroundColor: "#E0E0E0",
        borderRadius: 2.5,
        alignSelf: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 25,
        textAlign: "center",
        color: "#4C38CD",
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        marginBottom: 10,
        color: "#333",
        fontWeight: "600",
    },
    input: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: "#FAFAFA",
    },
    amountInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: "#FAFAFA",
    },
    dollarSign: {
        fontSize: 18,
        marginRight: 8,
        color: "#333",
        fontWeight: "600",
    },
    amountInput: {
        flex: 1,
        fontSize: 16,
    },
    modalButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginHorizontal: 8,
    },
    cancelButton: {
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    addButton: {
        backgroundColor: "#4C38CD",
    },
    disabledButton: {
        backgroundColor: "#A8A8A8",
    },
    cancelButtonText: {
        color: "#333",
        fontSize: 16,
        fontWeight: "600",
    },
    addButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    modalScrollView: {
        maxHeight: 400,
    },
    datePickerButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: "#FAFAFA",
    },
    dateText: {
        fontSize: 16,
        color: "#333",
    },
    iosPickerContainer: {
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
        marginTop: 10,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 10,
    },
    iosPickerHeader: {
        flexDirection: "row",
        justifyContent: "flex-end",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    iosPickerDoneText: {
        color: "#4C38CD",
        fontSize: 16,
        fontWeight: "600",
    },
    iosDatePicker: {
        height: 200,
        width: "100%",
    },
    selectedDateContainer: {
        backgroundColor: "#F5F5FF",
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    selectedDateLabel: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    selectedDateValue: {
        fontSize: 16,
        color: "#4C38CD",
        fontWeight: "600",
    },
});

export default function HomeTab() {
    const [view, setView] = useState("Monthly");
    const [viewOpen, setViewOpen] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const [selectedPeriod, setSelectedPeriod] = useState("Monthly"); // W, M, Y
    const [userData, setUserData] = useState<DocumentData | null>(null);
    const [activeTab, setActiveTab] = useState(0); // For paging between different visualizations
    const [spendingData, setSpendingData] = useState<SpendingDataState>({
        loading: true,
        data: null,
        error: null,
    });
    const [isListening, setIsListening] = useState(false);
    const [userGoals, setUserGoals] = useState<UserGoal[]>([]);
    const [loadingGoals, setLoadingGoals] = useState(true);
    // Add new state for the add goal modal
    const [addGoalModalVisible, setAddGoalModalVisible] = useState(false);
    const [newGoalName, setNewGoalName] = useState("");
    const [newGoalAmount, setNewGoalAmount] = useState("");
    const [newGoalDeadline, setNewGoalDeadline] = useState("Dec 2025");
    const [deadlineDate, setDeadlineDate] = useState(new Date(2025, 11, 31)); // Default to Dec 31, 2025
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isAddingGoal, setIsAddingGoal] = useState(false);
    // Animation value for modal
    const [modalAnimation] = useState(new Animated.Value(0));
    // Use our custom hook to get spending data
    const spendingDataHook = useSpendingData(user?.uid, selectedPeriod);

    useFocusEffect(
        useCallback(() => {
            // This will run every time the screen is focused
            console.log("Home screen focused");

            fetchData();

            return () => {
                console.log("Home screen unfocused");
            };
        }, [])
    );

    // Fetch user profile data
    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };

        fetchUserData();
    }, [user]);

    // Load savings goals
    useEffect(() => {
        const loadSavingsGoals = async () => {
            if (!user) return;

            setLoadingGoals(true);
            try {
                const goals = await fetchUserGoals(user.uid);
                console.log("Fetched user goals:", goals);
                setUserGoals(goals as UserGoal[]);
            } catch (error) {
                console.error("Error fetching user goals:", error);
            } finally {
                setLoadingGoals(false);
            }
        };

        loadSavingsGoals();
    }, [user]);

    // Set up goals listener
    useEffect(() => {
        if (!user) return;

        console.log("Setting up database listeners for real-time updates");

        // Enhanced goals listener
        const goalsRef = collection(db, "goals", user.uid, "settings");
        const goalsUnsubscribe = onSnapshot(
            goalsRef,
            (querySnapshot) => {
                const updatedGoals: UserGoal[] = [];
                querySnapshot.forEach((doc) => {
                    const goalData = doc.data();
                    updatedGoals.push({
                        id: doc.id,
                        goalName: goalData.goalName,
                        currentAmount: goalData.currentAmount,
                        targetAmount: goalData.targetAmount,
                        deadline: goalData.deadline || "Dec 2025", // Ensure deadline is captured
                        deadlineTimestamp: goalData.deadlineTimestamp, // Store timestamp if available
                        isCompleted: goalData.isCompleted,
                    });
                });

                console.log("Goals updated in real-time:", updatedGoals);
                setUserGoals(updatedGoals);
            },
            (error) => {
                console.error("Error listening to goals changes:", error);
            }
        );

        // Listen for budget changes
        const budgetRef = doc(db, "budgets", user.uid);
        const budgetUnsubscribe = onSnapshot(
            budgetRef,
            (docSnapshot) => {
                console.log("Budget updated in database, refreshing data...");
                fetchData();
            },
            (error) => {
                console.error("Error listening to budget changes:", error);
            }
        );

        // Listen for spending history changes across all categories
        const categories = [
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
        const transactionUnsubscribes: (() => void)[] = [];

        categories.forEach((category) => {
            const spendingRef = collection(
                db,
                "spending_history",
                user.uid,
                category
            );
            // We don't filter by date here to catch all changes
            const unsubscribe = onSnapshot(
                spendingRef,
                (querySnapshot) => {
                    console.log(
                        `${category} transactions updated, refreshing data...`
                    );
                    fetchData();
                },
                (error) => {
                    console.error(
                        `Error listening to ${category} transaction changes:`,
                        error
                    );
                }
            );

            transactionUnsubscribes.push(unsubscribe);
        });

        // Cleanup function
        return () => {
            console.log("Cleaning up database listeners");
            goalsUnsubscribe();
            budgetUnsubscribe();
            transactionUnsubscribes.forEach((unsubscribe) => unsubscribe());
        };
    }, [user]);

    // Function to fetch data based on the current view
    const fetchData = async () => {
        if (!user) return;

        setSpendingData((prev) => ({ ...prev, loading: true }));
        try {
            console.log(`Fetching spending data for period: ${view}`);
            const data = await fetchSpendingDataByPeriod(user.uid, view);
            console.log("Fetched spending data:", data);
            setSpendingData({
                loading: false,
                data: data,
                error: null,
            });
        } catch (error) {
            console.error("Error fetching spending data:", error);
            setSpendingData({
                loading: false,
                data: null,
                error: error as Error,
            });
        }
    };

    // Initial data load and when view changes
    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, view]);

    // Add back the handler functions for the restored components
    const handleSavingsGoalPress = (goalId: string) => {
        // This would navigate to a savings goal detail page
        // router.push(`/savings/goal/${goalId}`);
        console.log("Goal pressed:", goalId);
    };

    const userName = userData?.username;

    const fallbackData = {
        categories: [
            { name: "Food", spent: 450, budget: 500, color: "#4CAF50" },
            { name: "Bills", spent: 1200, budget: 1000, color: "#6C63FF" },
            { name: "Shopping", spent: 350, budget: 400, color: "#FF8A65" },
            { name: "Health", spent: 200, budget: 300, color: "#42A5F5" },
        ],
        totalSpent: 2500,
        totalBudget: 2200,
        percentage: 75,
    };

    // Only use fallbackData when there's no actual data
    const displayData = spendingData.data || fallbackData;

    const renderActiveChart = () => {
        switch (activeTab) {
            case 0:
                return (
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>
                            Budget vs Spending ({selectedPeriod})
                        </Text>

                        {/* Show loading indicator if data is loading */}
                        {spendingData.loading ? (
                            <View style={styles.loadingChartContainer}>
                                <ActivityIndicator
                                    size="large"
                                    color="#4C38CD"
                                />
                            </View>
                        ) : (
                            /* Using our SpendingBarChart component */
                            <SpendingBarChart
                                data={displayData.categories}
                                height={180}
                                barWidth={30}
                            />
                        )}
                    </View>
                );
            case 1:
                return (
                    <View style={styles.chartContainer}>
                        <MonthlySpendingChart height={180} />
                    </View>
                );
            case 2:
                return (
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>
                            Category Breakdown
                        </Text>

                        {/* Placeholder for a pie chart showing category breakdown */}
                        <View style={styles.pieChartPlaceholder}>
                            <Text style={styles.pieChartText}>
                                Category Breakdown Chart
                            </Text>
                            <Text style={styles.pieChartSubtext}>
                                Bills: 45%{"\n"}
                                Food: 25%{"\n"}
                                Shopping: 20%{"\n"}
                                Health: 10%
                            </Text>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    // Format date for display - replace with a more reliable method
    const formatDate = (date: Date): string => {
        try {
            // Use date-fns to format the date consistently
            return format(date, "MMM d, yyyy");
        } catch (error) {
            console.error("Error formatting date:", error);
            // Fallback manual formatting
            const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            const month = months[date.getMonth()];
            const day = date.getDate();
            const year = date.getFullYear();
            return `${month} ${day}, ${year}`;
        }
    };

    // Show modal with animation
    const showAddGoalModal = () => {
        setNewGoalName("");
        setNewGoalAmount("");
        const defaultDate = new Date();
        defaultDate.setFullYear(defaultDate.getFullYear() + 1);
        setDeadlineDate(defaultDate); // Reset to default date (1 year from now)
        setNewGoalDeadline(formatDate(defaultDate));
        setAddGoalModalVisible(true);
        Animated.timing(modalAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    // Handle date change with better error handling
    const onDateChange = (event: any, selectedDate?: Date) => {
        console.log("Date selected:", selectedDate); // Debug log

        setShowDatePicker(Platform.OS === "ios");

        if (selectedDate) {
            // Ensure date is valid
            if (!isNaN(selectedDate.getTime())) {
                setDeadlineDate(selectedDate);
                const formattedDate = formatDate(selectedDate);
                console.log("Formatted date:", formattedDate); // Debug log
                setNewGoalDeadline(formattedDate);
            } else {
                console.error("Invalid date selected");
            }
        }
    };

    // Show date picker with platform-specific handling
    const showDatePickerHandler = () => {
        console.log("Opening date picker");
        setShowDatePicker(true);
    };

    // Handle adding a goal with formatted date
    const handleAddGoal = async () => {
        if (!user) return;

        // Validate inputs
        if (!newGoalName.trim()) {
            Alert.alert("Invalid Name", "Goal name cannot be empty");
            return;
        }

        const targetAmount = parseFloat(newGoalAmount);
        if (isNaN(targetAmount) || targetAmount <= 0) {
            Alert.alert("Invalid Amount", "Please enter a valid target amount");
            return;
        }

        setIsAddingGoal(true);

        try {
            // Prepare the goal data with formatted deadline
            const goalData = {
                goalName: newGoalName,
                targetAmount: targetAmount,
                currentAmount: 0,
                deadline: newGoalDeadline,
                deadlineTimestamp: deadlineDate.getTime(), // Store timestamp for sorting and calculations
                isCompleted: false,
            };

            // Add the goal to Firebase
            const goalId = await addGoal(user.uid, goalData);

            if (goalId) {
                // Add the new goal to the state with its ID
                setUserGoals([
                    ...userGoals,
                    {
                        id: goalId,
                        goalName: newGoalName,
                        targetAmount: targetAmount,
                        currentAmount: 0,
                        deadline: newGoalDeadline,
                        isCompleted: false,
                    },
                ]);

                // Reset form and close modal
                setNewGoalName("");
                setNewGoalAmount("");
                hideAddGoalModal();
                Alert.alert("Success", "Goal added successfully!");
            } else {
                Alert.alert("Error", "Failed to add goal. Please try again.");
            }
        } catch (error) {
            console.error("Error adding goal:", error);
            Alert.alert("Error", "Failed to add goal. Please try again.");
        } finally {
            setIsAddingGoal(false);
        }
    };

    // Hide modal with animation
    const hideAddGoalModal = () => {
        Animated.timing(modalAnimation, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setAddGoalModalVisible(false);
        });
    };

    // Animation styles
    const modalTranslateY = modalAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [height, 0],
    });

    // Function to handle goal updates from SavingsGoalCard
    const handleGoalUpdated = (
        goalId: string,
        updatedGoal: Partial<UserGoal>
    ) => {
        console.log(`Goal updated: ${goalId}`, updatedGoal);
        // Update the userGoals state with the updated goal details
        setUserGoals(
            userGoals.map((goal) => {
                if (goal.id === goalId) {
                    return { ...goal, ...updatedGoal };
                }
                return goal;
            })
        );
    };

    const handlePeriodChange = (view) => {
        setView(view);
        setSelectedPeriod(view);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* User Greeting Section at the top, but centered */}
                <View
                    style={[
                        styles.greetingContainer,
                        { justifyContent: "center" },
                    ]}
                >
                    <Text
                        style={[styles.greetingText, { textAlign: "center" }]}
                    >
                        Hey, {userName}!
                    </Text>
                </View>

                {/* Total Expenses Section */}
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
                        setValue={handlePeriodChange}
                        style={styles.viewDropdown}
                        textStyle={styles.viewDropdownText}
                        dropDownContainerStyle={styles.viewDropdownContainer}
                        containerStyle={styles.viewDropdownContainerStyle}
                    />
                    {/* Show loading indicator if data is loading */}
                    {spendingData.loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4C38CD" />
                        </View>
                    ) : (
                        <>
                            {/* Progress Circle using our component with modified props */}
                            <CircularProgress
                                key={`progress-${displayData.percentage}`} // Add key to force re-render on percentage change
                                percentage={displayData.percentage}
                                size={240}
                                strokeWidth={20}
                                useDynamicColor={true}
                                bgColor="#E6E6FA"
                                rotation={-90}
                            >
                                <Text style={styles.expensesLabel}>
                                    Total Expenses
                                </Text>
                                <Text style={styles.expensesAmount}>
                                    ${displayData.totalSpent.toLocaleString()}
                                </Text>
                                <Text style={styles.expensesMax}>
                                    spent out of $
                                    {(typeof displayData.totalBudget ===
                                        "number" &&
                                    !isNaN(displayData.totalBudget)
                                        ? displayData.totalBudget.toFixed(2)
                                        : 0
                                    ).toLocaleString()}
                                </Text>
                            </CircularProgress>
                        </>
                    )}
                </View>

                {/* Spending Trends Section */}
                <View style={styles.trendsSectionContainer}>
                    <Text style={styles.sectionTitle}>Spending Trends</Text>

                    {/* Chart content based on active tab */}
                    {renderActiveChart()}
                </View>

                {/* Savings Goals Section */}
                <View style={styles.trendsSectionContainer}>
                    <Text style={styles.sectionTitle}>Savings Goals</Text>

                    {loadingGoals ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4C38CD" />
                        </View>
                    ) : userGoals.length > 0 ? (
                        userGoals.map((goal) => (
                            <SavingsGoalCard
                                key={goal.id}
                                goalId={goal.id}
                                title={goal.goalName}
                                currentAmount={goal.currentAmount}
                                targetAmount={goal.targetAmount}
                                deadline={goal.deadline || "Dec 2025"} // Use goal.deadline, fall back to default
                                isCompleted={goal.isCompleted}
                                onPress={() => handleSavingsGoalPress(goal.id)}
                                onGoalDeleted={(deletedGoalId: string) => {
                                    // Remove the deleted goal from the state
                                    setUserGoals((prevGoals) =>
                                        prevGoals.filter(
                                            (g) => g.id !== deletedGoalId
                                        )
                                    );
                                }}
                                onGoalUpdated={handleGoalUpdated} // Add the new callback
                            />
                        ))
                    ) : (
                        <View style={styles.noGoalsContainer}>
                            <Text style={styles.noGoalsText}>
                                You have no savings goals yet!
                            </Text>
                            <TouchableOpacity
                                style={styles.addGoalButton}
                                onPress={showAddGoalModal}
                            >
                                <Text style={styles.addGoalButtonText}>
                                    Add a Goal
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Add a "+" button for adding goals if there are already goals */}
                    {userGoals.length > 0 && (
                        <TouchableOpacity
                            style={styles.floatingAddButton}
                            onPress={showAddGoalModal}
                        >
                            <Feather name="plus" size={24} color="white" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Add Goal Modal */}
                <Modal
                    animationType="none"
                    transparent={true}
                    visible={addGoalModalVisible}
                    onRequestClose={hideAddGoalModal}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.centeredView}
                    >
                        <Animated.View
                            style={[
                                styles.modalView,
                                {
                                    transform: [
                                        { translateY: modalTranslateY },
                                    ],
                                },
                            ]}
                        >
                            <View style={styles.modalDragHandle} />
                            <Text style={styles.modalTitle}>
                                Create New Goal
                            </Text>

                            <ScrollView
                                style={styles.modalScrollView}
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>
                                        What are you saving for?
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        value={newGoalName}
                                        onChangeText={setNewGoalName}
                                        placeholder="e.g., New Car, Vacation, Emergency Fund"
                                        placeholderTextColor="#999"
                                        autoFocus
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>
                                        How much do you need?
                                    </Text>
                                    <View style={styles.amountInputContainer}>
                                        <Text style={styles.dollarSign}>$</Text>
                                        <TextInput
                                            style={styles.amountInput}
                                            value={newGoalAmount}
                                            onChangeText={setNewGoalAmount}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor="#999"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>
                                        Target date
                                    </Text>
                                    <Pressable
                                        onPress={showDatePickerHandler}
                                        style={styles.datePickerButton}
                                    >
                                        <Text style={styles.dateText}>
                                            {newGoalDeadline}
                                        </Text>
                                        <Feather
                                            name="calendar"
                                            size={20}
                                            color="#555"
                                        />
                                    </Pressable>

                                    {/* Show currently selected date in a more visible format */}
                                    {showDatePicker && (
                                        <View
                                            style={styles.selectedDateContainer}
                                        >
                                            <Text
                                                style={styles.selectedDateLabel}
                                            >
                                                Selected date:
                                            </Text>
                                            <Text
                                                style={styles.selectedDateValue}
                                            >
                                                {formatDate(deadlineDate)}
                                            </Text>
                                        </View>
                                    )}

                                    {showDatePicker && (
                                        <>
                                            {Platform.OS === "ios" ? (
                                                <View
                                                    style={
                                                        styles.iosPickerContainer
                                                    }
                                                >
                                                    <View
                                                        style={
                                                            styles.iosPickerHeader
                                                        }
                                                    >
                                                        <TouchableOpacity
                                                            onPress={() =>
                                                                setShowDatePicker(
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            <Text
                                                                style={
                                                                    styles.iosPickerDoneText
                                                                }
                                                            >
                                                                Done
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <DateTimePicker
                                                        testID="dateTimePicker"
                                                        value={deadlineDate}
                                                        mode="date"
                                                        display="spinner"
                                                        onChange={onDateChange}
                                                        minimumDate={new Date()}
                                                        style={
                                                            styles.iosDatePicker
                                                        }
                                                        textColor="#000000"
                                                        themeVariant="light"
                                                    />
                                                </View>
                                            ) : (
                                                <DateTimePicker
                                                    testID="dateTimePicker"
                                                    value={deadlineDate}
                                                    mode="date"
                                                    is24Hour={true}
                                                    display="default"
                                                    onChange={onDateChange}
                                                    minimumDate={new Date()}
                                                    themeVariant="light"
                                                    textColor="#000000"
                                                />
                                            )}
                                        </>
                                    )}
                                </View>
                            </ScrollView>

                            <View style={styles.modalButtonsContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.modalButton,
                                        styles.cancelButton,
                                    ]}
                                    onPress={hideAddGoalModal}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.modalButton,
                                        styles.addButton,
                                        isAddingGoal && styles.disabledButton,
                                    ]}
                                    onPress={handleAddGoal}
                                    disabled={isAddingGoal}
                                >
                                    {isAddingGoal ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="white"
                                        />
                                    ) : (
                                        <Text style={styles.addButtonText}>
                                            Create Goal
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </KeyboardAvoidingView>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
}
