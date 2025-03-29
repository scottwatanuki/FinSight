// fetchData.js
const { db } = require("../../firebase");
const {
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
} = require("firebase/firestore");
const { Timestamp } = require("firebase/firestore");

//hard coded for now
let categories = ["bills", "shopping", "food", "health"];

// FOR TESTING
const monthStartDate = Timestamp.fromDate(new Date("2025-03-01"));
const monthEndDate = Timestamp.fromDate(new Date("2025-03-31"));

async function fetchUserBudgetKeys(userID) {
    try {
        console.log("fetching user budget keys...");
        const docRef = doc(db, "budgets", userID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const keys = Object.keys(data);
            console.log("doc keys:", keys);
            return keys;
        } else {
            console.log("doc doesn't exist");
            return null;
        }
    } catch (error) {
        console.error("error fetching budget keys!", error);
    }
}

async function fetchAllBudgets() {
    try {
        console.log("Fetching data...");
        const querySnapshot = await getDocs(collection(db, "budgets")); // all docs in budgets
        let budgets = [];
        querySnapshot.forEach((doc) => {
            budgets.push({ id: doc.id, ...doc.data() });
        });
        console.log("budgets:", budgets);
        return budgets;
    } catch (error) {
        console.error("Error fetching document:", error);
    }
}

async function fetchUserBudget(userID) {
    try {
        console.log(`Fetching budget for user: ${userID}`);

        const budgetRef = doc(db, "budgets", userID);
        const budgetSnap = await getDoc(budgetRef);

        if (budgetSnap.exists()) {
            const budgetData = budgetSnap.data();
            console.log("User budget:", budgetData);
            return budgetData;
        } else {
            console.log("No budget found for this user.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user budget:", error);
        return null;
    }
}

async function fetchUserTransactionsByDate(
    userID,
    startDate,
    endDate,
    budgetKeys
) {
    try {
        console.log(
            `Fetching transactions for user: ${userID} during ${startDate}-${endDate}`
        );

        const userRef = doc(db, "spending_history", userID);
        let transactions = [];

        for (const category of budgetKeys) {
            const categoryRef = collection(userRef, category);
            const filterDates = query(
                categoryRef,
                where("date", ">=", startDate),
                where("date", "<=", endDate)
            );
            const transactionsSnapshot = await getDocs(filterDates);
            transactionsSnapshot.forEach((doc) => {
                transactions.push({ id: doc.id, category, ...doc.data() });
            });
        }
        console.log(
            `all transactions during ${startDate}-${endDate}: ${transactions.length}`
        );
        return transactions;
    } catch (error) {
        console.error("error getting transactions:", error);
        return [];
    }
}

async function fetchAllUserTransactions(userID) {
    try {
        console.log(`Fetching transactions for user: ${userID}`);

        const userRef = doc(db, "spending_history", userID);
        let transactions = [];

        for (const category of categories) {
            const categoryRef = collection(userRef, category);
            const transactionsSnapshot = await getDocs(categoryRef);
            transactionsSnapshot.forEach((doc) => {
                transactions.push({ id: doc.id, category, ...doc.data() });
            });
        }
        console.log("all transactions:", transactions);
        return transactions;
    } catch (error) {
        console.log(
            "Error in fetchAllUserTransctions. Cannot get transactions:",
            error
        );
        return [];
    }
}

async function fetchSpendingHistoryByCategory(
    userID,
    category,
    startDate,
    endDate
) {
    try {
        console.log(`fetch spending history for ${userID} in ${category}:`);
        const categoryCollectionRef = collection(
            db,
            "spending_history",
            userID,
            category
        );
        const filterDates = query(
            categoryCollectionRef,
            where("date", ">=", startDate),
            where("date", "<=", endDate)
        );
        const querySnapshot = await getDocs(filterDates);
        const transactions = [];
        console.log(`Number of documents in ${category}:`, querySnapshot.size);
        querySnapshot.forEach((doc) => {
            console.log("examine doc", doc);
            console.log("Document ID:", doc.id);
            console.log("Document Data:", doc.data());
        });

        querySnapshot.forEach((doc) => {
            console.log("examine doc", doc);
            const transactionData = doc.data();
            transactions.push({
                id: doc.id,
                amount: transactionData.amount,
                date: transactionData.date,
                description: transactionData.description,
            });
        });

        console.log(
            `DONE! Fetched transactions in ${category} for user ${userID}:`
        );
        return transactions;
    } catch (error) {
        console.error("Error fetching spending history:", error);
    }
}

function getDateRange(period) {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
        case "Daily":
            // Today
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                23,
                59,
                59,
                999
            );
            break;
        case "Weekly":
            // Current week (Sunday to Saturday)
            const day = now.getDay(); // 0 = Sunday, 6 = Saturday
            startDate = new Date(now); // Clone current date
            startDate.setDate(now.getDate() - day); // Go to beginning of week (Sunday)
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6); // Saturday
            endDate.setHours(23, 59, 59, 999);
            break;
        case "Monthly":
            // Current month
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0,
                23,
                59,
                59,
                999
            );
            break;
        case "Yearly":
            // Current year
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
        default:
            // Default to Monthly if period is invalid
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0,
                23,
                59,
                59,
                999
            );
    }

    console.log(
        `Date range for ${period}: ${startDate.toISOString()} to ${endDate.toISOString()}`
    );
    return {
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
    };
}

async function fetchSpendingDataByPeriod(userID, period) {
    try {
        console.log(
            `Fetching spending data for user ${userID} with period ${period}`
        );
        const { startDate, endDate } = getDateRange(period);
        const budget = await fetchUserBudget(userID);
        const transactions = await fetchUserTransactionsByDate(
            userID,
            startDate,
            endDate
        );

        console.log(
            `Found ${transactions.length} transactions for period ${period}`
        );

        // Process budget data for the selected period
        let modifiedBudget = { ...budget };

        // Adjust budget amounts based on the period
        if (period === "Daily") {
            // Scale down monthly budget to daily
            Object.keys(modifiedBudget).forEach((key) => {
                modifiedBudget[key] = modifiedBudget[key] / 30;
            });
        } else if (period === "Weekly") {
            // Scale down monthly budget to weekly
            Object.keys(modifiedBudget).forEach((key) => {
                modifiedBudget[key] = modifiedBudget[key] / 4;
            });
        } else if (period === "Yearly") {
            // Scale up monthly budget to yearly
            Object.keys(modifiedBudget).forEach((key) => {
                modifiedBudget[key] = modifiedBudget[key] * 12;
            });
        }
        // Monthly remains as is

        let totalSpent = 0;
        let spendingByCategory = {};

        transactions.forEach((transaction) => {
            totalSpent += transaction.amount;
            spendingByCategory[transaction.category] =
                (spendingByCategory[transaction.category] || 0) +
                transaction.amount;
        });

        let totalBudget = 0;
        Object.values(modifiedBudget || {}).forEach((amount) => {
            totalBudget += amount;
        });

        // Ensure we have data for all budget categories, even if there are no transactions
        const categories = Object.keys(modifiedBudget || {}).map(
            (category) => ({
                name: category,
                spent: spendingByCategory[category] || 0,
                budget: modifiedBudget[category] || 0,
                color: getCategoryColor(category),
            })
        );

        const result = {
            categories,
            totalSpent,
            totalBudget,
            percentage:
                totalBudget > 0
                    ? Math.min((totalSpent / totalBudget) * 100, 100)
                    : 0,
        };

        console.log("Processed spending data:", result);
        return result;
    } catch (error) {
        console.error("Error fetching spending data by period:", error);
        throw error;
    }
}

function getCategoryColor(category) {
    const colors = {
        food: "#4CAF50",
        bills: "#6C63FF",
        shopping: "#FF8A65",
        health: "#42A5F5",
    };
    return colors[category.toLowerCase()] || "#999999";
}

// Call function for testing
// fetchTotalSpendingPerCategory("7bx47gI4c5WuiKj8RsFEbQfUmEm1");

module.exports = {
    fetchUserBudgetKeys,
    fetchAllBudgets,
    fetchUserBudget,
    fetchUserTransactionsByDate,
    fetchSpendingHistoryByCategory,
    fetchAllUserTransactions,
    fetchSpendingDataByPeriod,
    getDateRange,
};
