import { db } from "../../firebase";
import {
    doc,
    updateDoc,
    collection,
    addDoc,
    deleteDoc,
    setDoc,
} from "firebase/firestore";
import { fetchUserBudget } from "./fetchData";

export async function setBudget(budgetData, userID) {
    try {
        const budgetRef = collection(db, "budgets", userID, "settings");
        const { category, amount, frequency } = budgetData;
        const convertedAmount = Number(amount);
        const docRef = await addDoc(budgetRef, {
            category: category,
            amount: convertedAmount,
            frequency: frequency,
        });
        return docRef.id;
    } catch (error) {
        console.error("Cannot update budget", error);
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
        const transactionRef = doc(
            db,
            "spending_history",
            userID,
            category,
            transactionId
        );
        await deleteDoc(transactionRef);
        console.log(
            `Transaction ${transactionId} deleted successfully from ${category}`
        );
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
            [category]: 0,
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
        Object.keys(budget).forEach((category) => {
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
