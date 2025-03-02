import { db } from "../../firebase";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";

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

export async function fetchTransactions(budgetId) {
    try {
        console.log(`Fetching: ${budgetId}:`);
        const budgetRef = doc(db, "budgets", budgetId);
        const transactionsSnapshot = await getDocs(
            collection(budgetRef, "transactions")
        );

        let transactions = [];
        transactionsSnapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });

        console.log("Transactions:", transactions);
        return transactions;
    } catch (error) {
        console.error("Error fetching transactions:", error);
    }
}

export async function fetchOneCategorySH(userID, category) {
    try {
        console.log(`fetch sh for ${userID} in ${category}:`);
        const categoryCollectionRef = collection(
            db,
            `spending_history/${userID}/${category}`
        );

        const querySnapshot = await getDocs(categoryCollectionRef);
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

fetchOneCategorySH("taylor_userid", "shopping");
