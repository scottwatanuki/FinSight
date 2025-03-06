import { db } from "../../firebase";
import { doc, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Add a transaction to a user's spending history
 * @param {string} userId - The user's ID
 * @param {string} category - The spending category (bills, food, shopping, health)
 * @param {number} amount - The transaction amount
 * @param {string} description - Description of the transaction
 * @param {string} date - Optional date string in YYYY-MM-DD format, defaults to today
 */
export const addTransaction = async (
  userId,
  category,
  amount,
  description,
  date
) => {
  try {
    // Validate category
    const validCategories = ["bills", "food", "shopping", "health"];
    if (!validCategories.includes(category)) {
      throw new Error(
        `Invalid category: ${category}. Must be one of: ${validCategories.join(
          ", "
        )}`
      );
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      throw new Error("Amount must be a positive number");
    }

    // Format date or use today
    const transactionDate = date || new Date().toISOString().split("T")[0];

    // Create the transaction object
    const transactionData = {
      amount,
      description,
      date: transactionDate,
      createdAt: serverTimestamp(),
    };

    // Add to the appropriate subcollection
    const categoryRef = collection(
      db,
      `spending_history/${userId}/${category}`
    );
    const docRef = await addDoc(categoryRef, transactionData);

    return {
      success: true,
      transactionId: docRef.id,
      data: {
        id: docRef.id,
        ...transactionData,
        category,
      },
    };
  } catch (error) {
    console.error("Error adding transaction:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Add multiple sample transactions for testing
 */
export const addSampleTransactions = async (userId) => {
  try {
    const today = new Date();
    const formatDate = (daysAgo) => {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      return date.toISOString().split("T")[0];
    };

    const transactions = [
      // Bills
      {
        category: "bills",
        amount: 150,
        description: "Electricity Bill",
        date: formatDate(2),
      },
      {
        category: "bills",
        amount: 80,
        description: "Water Bill",
        date: formatDate(5),
      },
      {
        category: "bills",
        amount: 120,
        description: "Internet",
        date: formatDate(8),
      },

      // Food
      {
        category: "food",
        amount: 45,
        description: "Grocery Store",
        date: formatDate(1),
      },
      {
        category: "food",
        amount: 28.5,
        description: "Restaurant",
        date: formatDate(3),
      },
      {
        category: "food",
        amount: 15.75,
        description: "Coffee Shop",
        date: formatDate(7),
      },

      // Shopping
      {
        category: "shopping",
        amount: 89.99,
        description: "Clothing",
        date: formatDate(4),
      },
      {
        category: "shopping",
        amount: 35.5,
        description: "Bookstore",
        date: formatDate(6),
      },
      {
        category: "shopping",
        amount: 120,
        description: "Electronics",
        date: formatDate(9),
      },

      // Health
      {
        category: "health",
        amount: 25,
        description: "Pharmacy",
        date: formatDate(2),
      },
      {
        category: "health",
        amount: 75,
        description: "Doctor Visit",
        date: formatDate(10),
      },
    ];

    // Add all transactions
    const results = [];
    for (const transaction of transactions) {
      const result = await addTransaction(
        userId,
        transaction.category,
        transaction.amount,
        transaction.description,
        transaction.date
      );
      results.push(result);
    }

    return { success: true, results };
  } catch (error) {
    console.error("Error adding sample transactions:", error);
    return { success: false, error: error.message };
  }
};

export default {
  addTransaction,
  addSampleTransactions,
};
