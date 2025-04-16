const { db } = require("../../firebase");
const {
  doc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  setDoc,
  increment,
  getDoc,
} = require("firebase/firestore");
const { fetchUserBudget } = require("./fetchData");

/**
 * 
 * @param {*} userID
 * @param {*} goalData: {
  goalName: "Emergency Fund",
  targetAmount: 5000, // total $$ needed
  currentAmount: 1200, // saved so far
  isCompleted: false,
}
 * @returns 
 */
async function addGoal(userID, goalData) {
  try {
    const goalsRef = collection(db, "goals", userID, "settings");
    console.log("from pushData.js, adding goal in db");
    const docRef = await addDoc(goalsRef, {
      goalName: goalData.goalName,
      targetAmount: Number(goalData.targetAmount),
      currentAmount: Number(goalData.currentAmount) || 0,
      isCompleted: false,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding goal in pushData.js :", error);
    return null;
  }
}

/**
 *
 * @param {*} userID
 * @param {*} goalID: goal key i.e 3PQT3jUdWhdfKlI8lSBw
 * @param {*} amountToAdd: number
 * @returns
 */
async function updateGoal(userID, goalID, amountToAdd) {
  try {
    const goalRef = doc(db, "goals", userID, "settings", goalID);
    const amount = Number(amountToAdd);

    await updateDoc(goalRef, {
      currentAmount: increment(amount),
    });

    const goalSnap = await getDoc(goalRef);
    const goal = goalSnap.data();

    if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
      await updateDoc(goalRef, {
        isCompleted: true,
      });
    }

    return goalID;
  } catch (error) {
    console.error("Error updating goal in pushData.js:", error);
    return null;
  }
}

async function setBudget(budgetData, userID) {
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

async function addSpending(spendingData, userID) {
  try {
    const { category, amount, date, description } = spendingData;
    const spendingRef = collection(db, "spending_history", userID, category);
    await addDoc(spendingRef, spendingData);
    console.log("Spending data added successfully!");
  } catch (error) {
    console.error("cannot add new spending", error);
  }
}

async function deleteTransaction(userID, category, transactionId) {
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

async function resetBudget(userID, category) {
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

async function resetAllBudgets(userID) {
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

// Add deleteGoal function
async function deleteGoal(userID, goalID) {
  try {
    const goalRef = doc(db, "goals", userID, "settings", goalID);
    await deleteDoc(goalRef);
    console.log(`Goal ${goalID} deleted successfully`);
    return true;
  } catch (error) {
    console.error("Error deleting goal:", error);
    throw error;
  }
}

// Add updateGoalDetails function
async function updateGoalDetails(userID, goalID, goalData) {
  try {
    const goalRef = doc(db, "goals", userID, "settings", goalID);

    // Create the update object
    const updateData = {};

    // Only include fields that are present in goalData
    if (goalData.goalName !== undefined) {
      updateData.goalName = goalData.goalName;
    }

    if (goalData.targetAmount !== undefined) {
      updateData.targetAmount = Number(goalData.targetAmount);

      // Check if the goal should be marked as completed based on new target
      const goalSnap = await getDoc(goalRef);
      const currentData = goalSnap.data();
      if (currentData && currentData.currentAmount >= updateData.targetAmount) {
        updateData.isCompleted = true;
      } else if (
        currentData &&
        currentData.currentAmount < updateData.targetAmount
      ) {
        updateData.isCompleted = false;
      }
    }

    if (goalData.deadline !== undefined) {
      updateData.deadline = goalData.deadline;
    }

    await updateDoc(goalRef, updateData);
    console.log(`Goal ${goalID} updated successfully with data:`, updateData);
    return true;
  } catch (error) {
    console.error("Error updating goal details:", error);
    throw error;
  }
}

module.exports = {
  addGoal,
  updateGoal,
  deleteGoal,
  updateGoalDetails,
  setBudget,
  addSpending,
  deleteTransaction,
  resetBudget,
  resetAllBudgets,
};

// Test code - commented out to prevent automatic execution
/*
const mockGoal = {
  goalName: "Emergency Fund",
  targetAmount: 5000,
  currentAmount: 0,
};
const mockUserID = "7bx47gI4c5WuiKj8RsFEbQfUmEm1";
const mockGoalID = "3PQT3jUdWhdfKlI8lSBw";

async function runTest() {
  // const goalID = await addGoal(mockUserID, mockGoal);
  // console.log(goalID);
  updateGoal(mockUserID, mockGoalID, 300);
}

// runTest();
*/
