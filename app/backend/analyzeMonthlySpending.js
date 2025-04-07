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
        console.log("budgets", budgets);
        let remainingBudget = {};
        for (const category of categories) {
            if (!budgets[category] || !spendingBreakdown[category]) {
                continue;
            }
            let spent = Number(budgets[category]["amount"]);
            remainingBudget[category] =
                spent - spendingBreakdown[category]["total"];
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

async function calculateTotalSavings(userID) {
    try {
        let savings = { totalSavings: 0 };

        const start = new Date("2025-01-01");
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        for (let year = 2025; year <= currentYear; year++) {
            const monthStart = year === 2025 ? 0 : 0;
            const monthEnd = year === currentYear ? currentMonth : 11;

            for (let month = monthStart; month <= monthEnd; month++) {
                const monthStartDate = new Date(year, month, 1);
                const monthEndDate = new Date(year, month + 1, 0);

                const monthlyRemaining = await compareBudgetVsSpendingByDate(
                    userID,
                    monthStartDate,
                    monthEndDate
                );

                if (monthlyRemaining) {
                    for (const cat in monthlyRemaining) {
                        const value = monthlyRemaining[cat];
                        if (value > 0) {
                            savings.totalSavings += value;
                            if (!savings[cat]) {
                                savings[cat] = 0;
                            }
                            savings[cat] += value;
                        }
                    }
                }
            }
        }

        console.log("from analyzemonthlyspending, total savings", savings);
        return savings;
    } catch (error) {
        console.error("Error calculating total savings:", error);
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
        }
        return predictions;
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
/**
 * 
 * @param {*} userID 
 * @returns 
{
  Lifestyle: {
    totalPredicted: 340, //total prediction amount over all subcategories
    totalHistorical: 615,
    totalMonths: 5,
    subcategories: [ 'entertainment', 'dining', 'recreational', 'shopping' ],
    count: 4, //len subcategories array
    avgPredicted: 85, // ***USE FOR HOME PAGE**
    avgHistorical: 153.75
  },
}
 */
async function groupMonthlyMedianSpending(userID) {
    try {
        const predictions = await monthlyMedianSpending(userID);
        const categoryMapping = {
            groceries: "Essentials",
            bills: "Essentials",
            health: "Essentials",
            subscriptions: "Essentials",

            entertainment: "Lifestyle",
            dining: "Lifestyle",
            recreational: "Lifestyle",
            shopping: "Lifestyle",

            transportation: "Travel",
            travel: "Travel",

            misc: "Miscellaneous",
        };
        let grouped_predictions = {};
        for (const [category, data] of Object.entries(predictions)) {
            // add up
            const groupName = categoryMapping[category];
            if (!groupName) continue;
            if (!grouped_predictions[groupName]) {
                grouped_predictions[groupName] = {
                    totalPredicted: 0,
                    totalHistorical: 0,
                    totalMonths: 0,
                    subcategories: [],
                    count: 0,
                };
            }
            const amount = Number(data.predictedAmount) || 0;
            const months = Number(data.monthsUsed) || 0;
            const historicalTotal = Number(data.historicalData?.total) || 0;

            console.log(
                "curr predicted amount",
                grouped_predictions[groupName]
            );
            grouped_predictions[groupName].totalPredicted += amount;
            grouped_predictions[groupName].totalHistorical += historicalTotal;
            grouped_predictions[groupName].totalMonths += months;
            grouped_predictions[groupName].subcategories.push(category);
            grouped_predictions[groupName].count++;
        }

        // avg out each cat
        for (const [groupName, groupData] of Object.entries(
            grouped_predictions
        )) {
            groupData.avgPredicted =
                groupData.count > 0
                    ? groupData.totalPredicted / groupData.count
                    : 0;

            groupData.avgHistorical =
                groupData.count > 0
                    ? groupData.totalHistorical / groupData.count
                    : 0;
        }
        console.log(
            `${userID}'s consolidated predicted spending for next month:`
        );
        console.log(grouped_predictions);
        return grouped_predictions;
    } catch (error) {
        console.error("Error analyzing monthly spending:", error);
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
calculateTotalSavings(mockUserID);

module.exports = {
    fetchSpendingPerCategoryByDate,
    fetchTotalSpendingPerCategory,
    monthlyMedianSpending,
    groupMonthlyMedianSpending,
    calculateTotalSavings,
};
