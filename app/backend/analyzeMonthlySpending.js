const { db } = require("../../firebase");
const {
    fetchSpendingHistoryByCategory,
    fetchUserBudget,
    fetchAllUserTransactions,
    fetchUserBudgetKeys,
} = require("./fetchData");
const { Timestamp } = require("firebase/firestore");
let categories = [
    //hardcoded for now
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

// dates for testing
const monthStartDate = Timestamp.fromDate(new Date("2025-03-01"));
const monthEndDate = Timestamp.fromDate(new Date("2025-03-31"));
const mockUserID = "7bx47gI4c5WuiKj8RsFEbQfUmEm1";

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
async function fetchSpendingPerCategoryByDate(
    userID,
    startDate,
    endDate,
    budgetKeys
) {
    try {
        console.log("fetching spending per category....");
        let spendingPerCategory = {}; // "shopping": {total: 250, transactions: []}
        spendingPerCategory["total"] = 0;
        console.log("list of budgets:", budgetKeys);
        for (const category of budgetKeys) {
            console.log(
                "in fetchSpendingPerCategoryByDate, adding up expenses for ",
                category
            );
            const transactions = await fetchSpendingHistoryByCategory(
                userID,
                category,
                startDate,
                endDate
            );
            console.log(
                "fetchSpendingPerCategoryByDate's record of transactions",
                transactions
            );
            let total_amount_spent = 0;
            if (transactions.length == 0) {
                console.log("length is 0");
                total_amount_spent += 0;
            } else {
                for (const trans of transactions) {
                    total_amount_spent += trans.amount;
                }
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
        console.log(
            "in fetchSpendingPerCategoryByDate, spendingPerCategory is",
            spendingPerCategory
        );
        return spendingPerCategory;
    } catch (error) {
        console.log(
            "fetchSpendingPerCategoryByDate not working. Cannot calc user's spending curretly"
        );
    }
}

//helper function
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

    console.log(
        "in organizeTransactionsByMonthAndCategory, DONE organizing all transaction data:",
        spendingData
    );
    return spendingData;
}

// helper function
function calculateMedian(values) {
    if (!values.length) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    return sorted.length % 2 === 0
        ? (sorted[middle - 1] + sorted[middle]) / 2
        : sorted[middle];
}

/**
 * calc how much user has spent of their budget in this month

 * @return_example
    {entertainment: 100, travel: 100, bills: -1000, ...}
 */
async function compareBudgetVsSpendingByDate(
    userID,
    monthStartDate,
    monthEndDate
) {
    try {
        let budgetKeys = await fetchUserBudgetKeys(userID);
        let spendingBreakdown = await fetchSpendingPerCategoryByDate(
            userID,
            monthStartDate,
            monthEndDate,
            budgetKeys
        );
        let budgets = await fetchUserBudget(userID);

        let remainingBudget = {};
        for (const category of categories) {
            remainingBudget[category] =
                budgets[category] - spendingBreakdown[category]["total"];
        }
        console.log(`${userID}'s remaining budget:`);
        console.log(remainingBudget);
        return remainingBudget;
    } catch {
        console.log(
            "Error in compareBudgetvsSpendingByDate. Cannot compare budget vs spending."
        );
        return null;
    }
}

/**
 * uses previous months spending in each category to find median spent in each category
 *
 * @return_example
 * {bills: {
    predictedAmount: 1300,
    historicalData: { total: 4450, months: [Object] },
    monthsUsed: 3}, ...}
 */
async function monthlyMedianSpending(userID) {
    try {
        const transactions = await fetchAllUserTransactions(userID);
        const organizedData = await organizeTransactionsByMonthAndCategory(
            transactions
        );
        const predictions = {};

        for (const category in organizedData) {
            const categoryData = organizedData[category];
            const months = Object.values(categoryData.months);
            const spendingValues = months.map((month) => month.spent);

            const median = calculateMedian(spendingValues);

            predictions[category] = {
                predictedAmount: Math.round(median * 100) / 100,
                historicalData: categoryData,
                monthsUsed: spendingValues.length,
            };

            console.log(`${userID}'s predicted spending for next month:`);
            console.log(predictions);
            return predictions;
        }
    } catch (error) {
        console.error("Error analyzing monthly spending:", error);
        return null;
    }
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

// let spendingData = fetchTotalSpendingPerCategory(
//     "7bx47gI4c5WuiKj8RsFEbQfUmEm1"
// ); //1
// let budgetVsSpending = compareBudgetVsSpendingByDate(
//     mockUserID,
//     monthStartDate,
//     monthEndDate
// ); //2
monthlyMedianSpending(mockUserID);

module.exports = {
    fetchSpendingPerCategoryByDate,
    fetchTotalSpendingPerCategory,
};