import { db } from "../../firebase";
import { doc, updateDoc, collection, addDoc, deleteDoc, setDoc } from "firebase/firestore";
import { fetchUserBudget } from "./fetchData";

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

export async function addSpending(spendingData, userID) {
    try {
        const { category, amount, date, description } = spendingData;
        const spendingRef = collection(
            db,
            "spending_history",
            userID,
            category
        );
        await addDoc(spendingRef, spendingData);
        console.log("Spending data added successfully!");
    } catch (error) {
        console.error("cannot add new spending", error);
    }
}

export async function deleteTransaction(userID, category, transactionId) {
    try {
        const transactionRef = doc(db, "spending_history", userID, category, transactionId);
        await deleteDoc(transactionRef);
        console.log(`Transaction ${transactionId} deleted successfully from ${category}`);
        return true;
    } catch (error) {
        console.error("Error deleting transaction:", error);
        return false;
    }
}

export async function resetBudget(userID, category) {
    try {
        const budgetRef = doc(db, "budgets", userID);
        // Update the document to remove only the specified category
        await updateDoc(budgetRef, {
            [category]: 0
        });
        console.log(`Budget for ${category} reset to 0 for user ${userID}`);
        return true;
    } catch (error) {
        console.error("Error resetting budget:", error);
        return false;
    }
}

export async function resetAllBudgets(userID) {
    try {
        const budgetRef = doc(db, "budgets", userID);
        
        // Get the current budget document to find all categories
        const budget = await fetchUserBudget(userID);
        
        if (!budget) {
            console.log("No budgets to reset");
            return false;
        }
        
        // Create an object with all categories set to 0
        const resetBudgets = {};
        Object.keys(budget).forEach(category => {
            resetBudgets[category] = 0;
        });
        
        // Update the document with all budgets set to 0
        await setDoc(budgetRef, resetBudgets);
        console.log(`All budgets reset to 0 for user ${userID}`);
        return true;
    } catch (error) {
        console.error("Error resetting all budgets:", error);
        return false;
    }
}
