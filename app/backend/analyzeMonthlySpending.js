const { db } = require("../../firebase");
const {
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
} = require("firebase/firestore");
const {
    getSpendingHistoryByCategory,
    fetchSpendingPerCategoryByDate,
    fetchUserBudget,
} = require("./fetchData");
const { Timestamp } = require("firebase/firestore");
let categories = ["bills", "shopping", "food", "health"];

// dates for testing
const monthStartDate = Timestamp.fromDate(new Date("2025-03-01"));
const monthEndDate = Timestamp.fromDate(new Date("2025-03-31"));

/**
 * calc how much user has spent of their budget in this month

 * @returns_example
    { bills: 1500, shopping: 200, food: -108, health: 50 }
 */
async function compareBudgetVsSpending(userID, monthStartDate, monthEndDate) {
    try {
        let spendingBreakdown = await fetchSpendingPerCategoryByDate(
            userID,
            monthStartDate,
            monthEndDate
        );
        let budgets = await fetchUserBudget(userID);

        let remainingBudget = {};
        for (const category of categories) {
            remainingBudget[category] =
                budgets[category] - spendingBreakdown[category]["total"];
        }
        console.log(`${userID}'s remaining budget:`);
        console.log(remainingBudget);
    } catch {
        console.log(
            "Error in compareBudgetvsSpending. Cannot compare budget vs spending."
        );
        return null;
    }
}

/**
 * Calculates the mean spending for each category based on previous months
 *
 * @returns_example
 */
function calculateMeanSpending(spendingData) {}

async function predictionFunctions(userID, monthStartDate, monthEndDate) {}
// calculateMeanSpending("7bx47gI4c5WuiKj8RsFEbQfUmEm1");
