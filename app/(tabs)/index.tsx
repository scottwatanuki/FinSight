import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { doc, getDoc, collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import DropDownPicker from "react-native-dropdown-picker";
import { fetchSpendingDataByPeriod } from "../backend/fetchData";

import CircularProgress from "../../components/CircularProgress";
import SpendingBarChart from "../../components/SpendingBarChart";
import MonthlySpendingChart from "../../components/MonthlySpendingChart";
import SavingsGoalCard from "../../components/SavingsGoalCard";
import FinancialInsightsCard from "../../components/FinancialInsightsCard";
import { useSpendingData } from "../../hooks/useSpendingData";

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
});

export default function HomeTab() {
    const [view, setView] = useState("Weekly");
    const [viewOpen, setViewOpen] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const [selectedPeriod, setSelectedPeriod] = useState("M"); // W, M, Y
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState(0); // For paging between different visualizations
    const [spendingData, setSpendingData] = useState({
      loading: true,
      data: null,
      error: null
    });
    const [isListening, setIsListening] = useState(false);
  // Use our custom hook to get spending data
  const spendingDataHook = useSpendingData(user?.uid, selectedPeriod);

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

  // Set up real-time listeners for database changes
  useEffect(() => {
    if (!user) return;
    
    console.log("Setting up database listeners for real-time updates");
    
    // Listen for budget changes
    const budgetRef = doc(db, "budgets", user.uid);
    const budgetUnsubscribe = onSnapshot(budgetRef, (docSnapshot) => {
      console.log("Budget updated in database, refreshing data...");
      fetchData();
    }, (error) => {
      console.error("Error listening to budget changes:", error);
    });

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
    const transactionUnsubscribes = [];

    categories.forEach(category => {
      const spendingRef = collection(db, "spending_history", user.uid, category);
      // We don't filter by date here to catch all changes
      const unsubscribe = onSnapshot(spendingRef, (querySnapshot) => {
        console.log(`${category} transactions updated, refreshing data...`);
        fetchData();
      }, (error) => {
        console.error(`Error listening to ${category} transaction changes:`, error);
      });

      transactionUnsubscribes.push(unsubscribe);
    });

    // Cleanup function to unsubscribe from all listeners
    return () => {
      console.log("Cleaning up database listeners");
      budgetUnsubscribe();
      transactionUnsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [user]); // Remove isListening dependency to ensure listeners are always set up

  // Function to fetch data based on the current view
  const fetchData = async () => {
    if (!user) return;
    
    setSpendingData(prev => ({ ...prev, loading: true }));
    try {
      console.log(`Fetching spending data for period: ${view}`);
      const data = await fetchSpendingDataByPeriod(user.uid, view);
      console.log("Fetched spending data:", data);
      setSpendingData({
        loading: false,
        data: data,
        error: null
      });
    } catch (error) {
      console.error("Error fetching spending data:", error);
      setSpendingData({
        loading: false,
        data: null,
        error: error
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
    const handleSavingsGoalPress = () => {
        // This would navigate to a savings goal detail page
        // router.push("/savings/goal/1");
    };

    const handleViewAllInsights = () => {
        // This would navigate to insights page
        // router.push("/insights");
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

  const displayData = spendingData.data || fallbackData;

  const renderActiveChart = () => {
    switch (activeTab) {
      case 0:
        return (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Budget vs Spending ({selectedPeriod})</Text>

            {/* Show loading indicator if data is loading */}
            {spendingData.loading ? (
              <View style={styles.loadingChartContainer}>
                <ActivityIndicator size="large" color="#4C38CD" />
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
            <Text style={styles.chartTitle}>Category Breakdown</Text>

            {/* Placeholder for a pie chart showing category breakdown */}
            <View style={styles.pieChartPlaceholder}>
              <Text style={styles.pieChartText}>Category Breakdown Chart</Text>
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

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* User Greeting Section at the top, but centered */}
            <View style={[styles.greetingContainer, { justifyContent: 'center' }]}>
                <Text style={[styles.greetingText, { textAlign: 'center' }]}>Hey, {userName}!</Text>
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
                    setValue={setView}
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
                            <Text style={styles.expensesLabel}>Expenses</Text>
                            <Text style={styles.expensesAmount}>
                                ${displayData.totalSpent.toLocaleString()}
                            </Text>
                            <Text style={styles.expensesMax}>
                                Out of ${(typeof displayData.totalBudget === 'number' && !isNaN(displayData.totalBudget) ? 
                                  displayData.totalBudget : 0).toLocaleString()}
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

            {/* Restore Savings Goal Card */}
            <SavingsGoalCard
                title="New Car"
                currentAmount={3500}
                targetAmount={15000}
                deadline="Dec 2023"
                onPress={handleSavingsGoalPress}
            />

            {/* Restore Financial Insights Card */}
            <FinancialInsightsCard onViewAll={handleViewAllInsights} />
        </ScrollView>
    </SafeAreaView>
);
}
