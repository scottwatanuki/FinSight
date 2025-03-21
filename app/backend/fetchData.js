import { db } from "../../firebase";
import {
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

let categories = ["bills", "shopping", "food", "health"];
const monthStartDate = Timestamp.fromDate(new Date("2025-02-01"));
const monthEndDate = Timestamp.fromDate(new Date("2025-02-28"));
const weekStartDate = Timestamp.fromDate(new Date("2025-02-01"));
const weekEndDate = Timestamp.fromDate(new Date("2025-02-08"));

export async function fetchUserBudgetKeys(userID) {
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

export async function fetchAllBudgets() {
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

export async function fetchUserBudget(userID) {
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

export async function fetchTransactions(userID, startDate, endDate) {
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

export async function fetchOneCategorySH(userID, category, startDate, endDate) {
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

        console.log(
            `Fetched ${transactions.length} transactions in ${category} for user ${userID}`
        );
        return transactions;
    } catch (error) {
        console.error("Error fetching spending history:", error);
    }
}

export async function fetchSpendingPerCategory(userID, startDate, endDate) {
    try {
        let spendingPerCategory = {}; // "shopping": {total: 250, transactions: []}
        console.log("fetching spending per category....");
        for (const category of categories) {
            const transactions = await fetchOneCategorySH(
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
        console.log("cannot calc user's spending curretly");
    }
}

// fetchOneCategorySH("taylor_userid", "shopping", monthStartDate, monthEndDate);
