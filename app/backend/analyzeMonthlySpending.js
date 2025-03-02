import { db } from "../../firebase";
import { doc } from "firebase/firestore";
import { fetchOneCategorySH, fetchUserBudget } from "./fetchData";

var categories = ["bills", "shopping", "food", "health"];

function isWithinMonth(date) {
    //YYYY-MM-DD
    const transactionDate = new Date(date);
    const currentDate = new Date();

    return (
        transactionDate.getFullYear() === currentDate.getFullYear() &&
        transactionDate.getMonth() === currentDate.getMonth()
    );
}

export async function analyzeMonthlySpending(userID) {
    try {
        console.log("--------analyzing monthly spending-------");
        // fetch user's budget
        const userBudget = await fetchUserBudget(userID);
        if (!userBudget) {
            return;
        }
        console.log(
            `${userID} has a budget of: bills:${userBudget.bills}, shopping:${userBudget.shopping},food:${userBudget.food}, health:${userBudget.health}`
        );

        //fetch user's total spent in each budget
        spendingPerCategory = {}; // "shopping": {total: 250, transactions: []}
        for (const category of categories) {
            const transactions = await fetchOneCategorySH(userID, category);
            var total_amount_spent = 0;
            for (const trans of transactions) {
                total_amount_spent += trans.amount;
            }
            spendingPerCategory[category] = { total: total_amount_spent };
            spendingPerCategory[category]["transactions"] = transactions;
            console.log(
                `num of transactions: ${spendingPerCategory[category]["transactions"].length}`
            );
            console.log(
                `${userID} spent ${spendingPerCategory[category]} on ${category}`
            );
        }
    } catch (error) {
        console.error("Error analyzing monthly spending:", error);
    }
}

analyzeMonthlySpending("taylor_userid");
