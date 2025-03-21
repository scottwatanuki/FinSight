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
let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

// FOR TESTING
const monthStartDate = Timestamp.fromDate(new Date("2025-03-01"));
const monthEndDate = Timestamp.fromDate(new Date("2025-03-31"));

async function fetchUserBudgetKeys(userID) {
    try {
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

async function fetchUserTransactionsByDate(userID, startDate, endDate) {
    try {
        console.log(
            `Fetching transactions for user: ${userID} during ${startDate}-${endDate}`
        );

        const userRef = doc(db, "spending_history", userID);
        let transactions = [];

        for (const category of categories) {
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
        console.log("all transactions:", transactions);
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
            console.log("Document ID:", doc.id);
            console.log("Document Data:", doc.data());
        });

        querySnapshot.forEach((doc) => {
            const transactionData = doc.data();
            transactions.push({
                id: doc.id,
                amount: transactionData.amount,
                date: transactionData.date,
                description: transactionData.description,
            });
        });

        console.log(`Fetched transactions in ${category} for user ${userID}`);
        return transactions;
    } catch (error) {
        console.error("Error fetching spending history:", error);
    }
}

/**
 * get total spending during month & spending breakdown from each category 

 * @returns_example
    {
        total: 170,
        bills: { total: 0, transactions: [] },
        shopping: { total: 0, transactions: [] },
        food: { total: 120, transactions: [ [Object] ] },
        health: { total: 50, transactions: [ [Object] ] }
      }
 */
async function fetchSpendingPerCategoryByDate(userID, startDate, endDate) {
    try {
        let spendingPerCategory = {}; // "shopping": {total: 250, transactions: []}
        spendingPerCategory["total"] = 0;
        console.log("fetching spending per category....");
        for (const category of categories) {
            const transactions = await fetchSpendingHistoryByCategory(
                userID,
                category,
                startDate,
                endDate
            );
            let total_amount_spent = 0;
            for (const trans of transactions) {
                total_amount_spent += trans.amount;
            }
            spendingPerCategory[category] = { total: total_amount_spent };
            spendingPerCategory[category]["transactions"] = transactions;
            spendingPerCategory["total"] += total_amount_spent;
            console.log(
                `num of transactions: ${spendingPerCategory[category]["transactions"].length}`
            );
            console.log(
                `${userID} spent ${spendingPerCategory[category]} on ${category}`
            );
        }
        console.log(spendingPerCategory);
        return spendingPerCategory;
    } catch (error) {
        console.log(
            "fetchSpendingPerCategoryByDate not working. Cannot calc user's spending curretly"
        );
    }
}

function organizeTransactionsByMonthAndCategory(transactions) {
    const spendingData = {};

    for (const transaction of transactions) {
        const { category, amount, date } = transaction;
        const transactionDate = date.toDate();
        const monthStart = new Date(
            transactionDate.getFullYear(),
            transactionDate.getMonth(),
            1
        );
        const monthKey = monthStart.toISOString().slice(0, 7);

        if (!spendingData[category]) {
            spendingData[category] = {
                total: 0,
                months: {},
            };
        }

        if (!spendingData[category].months[monthKey]) {
            spendingData[category].months[monthKey] = {
                startDate: monthStart,
                spent: 0,
            };
        }
        spendingData[category].total += amount;
        spendingData[category].months[monthKey].spent += amount;
    }

    return spendingData;
}

/**
 * get total spending during month & spending breakdown for each cat
 *
 * @example_output
 * {
 *   bills: {
 *     total: 1200,
 *     months: {
 *       "2025-01": { startDate: "2025-01-01", spent: 400 },
 *       "2025-02": { startDate: "2025-02-01", spent: 800 },
 *     },
 *   },
 *   shopping: {
 *     total: 500,
 *     months: {
 *       "2025-01": { startDate: "2025-01-01", spent: 200 },
 *       "2025-02": { startDate: "2025-02-01", spent: 300 },
 *     },
 *   },
 * }
 */
async function fetchTotalSpendingPerCategory(userID) {
    try {
        const transactions = await fetchAllUserTransactions(userID);
        const spendingData =
            organizeTransactionsByMonthAndCategory(transactions);

        console.log(`${userID}'s total spending per category:`);
        console.log(spendingData);

        return spendingData;
    } catch (error) {
        console.log("Error fetching total spending per category:", error);
        return null;
    }
}

// Call the function for testing
fetchTotalSpendingPerCategory("7bx47gI4c5WuiKj8RsFEbQfUmEm1");

module.exports = {
    fetchUserBudgetKeys,
    fetchAllBudgets,
    fetchUserBudget,
    fetchUserTransactionsByDate,
    fetchSpendingHistoryByCategory,
    fetchSpendingPerCategoryByDate,
};
