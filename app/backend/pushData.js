import { db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function setBudget(budgetData, userID) {
    try {
        const budgetRef = doc(db, "budgets", userID);
        // assume default freq. is monthly in db
        const { category, amount, frequency } = budgetData;
        let finalAmount = parseFloat(amount);
        let lowercaseCategory = category.toLowerCase();
        if (frequency == "daily") {
            finalAmount = amount * 30; //assume 30 days in a month??
        } else if (frequency == "yearly") {
            finalAmount = amount / 12;
        }

        const newBudget = {
            [lowercaseCategory]: finalAmount,
        };

        updateDoc(budgetRef, newBudget);
        console.log(`updated budget for ${category}: ${finalAmount}.`);
    } catch (error) {
        console.error("cannot update budget", error);
    }
}
