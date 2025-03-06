import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

export const useSpendingData = (userId, period = "M") => {
  const [spendingData, setSpendingData] = useState({
    loading: true,
    error: null,
    budgets: null,
    expenses: null,
    categories: [],
    totalSpent: 0,
    totalBudget: 0,
    percentage: 0,
  });

  useEffect(() => {
    const fetchSpendingData = async () => {
      if (!userId) {
        setSpendingData((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        // 1. Fetch user budget
        const budgetDoc = await getDoc(doc(db, "budgets", userId));
        const budgetData = budgetDoc.exists() ? budgetDoc.data() : null;

        if (!budgetData) {
          setSpendingData({
            loading: false,
            error: "No budget found",
            budgets: null,
            expenses: null,
            categories: [],
            totalSpent: 0,
            totalBudget: 0,
            percentage: 0,
          });
          return;
        }

        // 2. Initialize categories
        const categories = ["bills", "shopping", "food", "health"];

        // 3. Get current date info for period filtering
        const currentDate = new Date();
        let startDate;

        // Set start date based on selected period
        if (period === "W") {
          // Start of week (Sunday)
          const dayOfWeek = currentDate.getDay();
          startDate = new Date(currentDate);
          startDate.setDate(currentDate.getDate() - dayOfWeek);
          startDate.setHours(0, 0, 0, 0);
        } else if (period === "M") {
          // Start of month
          startDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );
        } else if (period === "Y") {
          // Start of year
          startDate = new Date(currentDate.getFullYear(), 0, 1);
        }

        // 4. Fetch spending for each category
        const categoryData = [];
        let totalSpent = 0;
        let totalBudget = 0;

        for (const category of categories) {
          // Get transactions for this category
          const categoryRef = collection(
            db,
            `spending_history/${userId}/${category}`
          );
          const q = query(categoryRef);
          const querySnapshot = await getDocs(q);

          // Calculate total spent
          let spent = 0;
          const transactions = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Check if transaction is within the selected period
            if (period !== "ALL") {
              const transactionDate = new Date(data.date);
              if (transactionDate >= startDate) {
                spent += data.amount;
                transactions.push({
                  id: doc.id,
                  ...data,
                });
              }
            } else {
              spent += data.amount;
              transactions.push({
                id: doc.id,
                ...data,
              });
            }
          });

          // Get budget for this category
          const budget = budgetData[category] || 0;

          // Add to totals
          totalSpent += spent;
          totalBudget += budget;

          // Add to category data
          categoryData.push({
            name: category.charAt(0).toUpperCase() + category.slice(1),
            spent,
            budget,
            transactions,
            color: getCategoryColor(category),
          });
        }

        // 5. Calculate percentage
        const percentage =
          totalBudget > 0
            ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100)
            : 0;

        // 6. Update state
        setSpendingData({
          loading: false,
          error: null,
          budgets: budgetData,
          categories: categoryData,
          totalSpent,
          totalBudget,
          percentage,
        });
      } catch (error) {
        console.error("Error fetching spending data:", error);
        setSpendingData({
          loading: false,
          error: error.message,
          budgets: null,
          expenses: null,
          categories: [],
          totalSpent: 0,
          totalBudget: 0,
          percentage: 0,
        });
      }
    };

    fetchSpendingData();
  }, [userId, period]);

  return spendingData;
};

// Helper function to get a color for a category
const getCategoryColor = (category) => {
  const colors = {
    bills: "#6C63FF", // Purple
    shopping: "#FF8A65", // Orange
    food: "#4CAF50", // Green
    health: "#42A5F5", // Blue
  };

  return colors[category] || "#6C63FF";
};
