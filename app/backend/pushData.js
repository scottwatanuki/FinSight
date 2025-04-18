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
    getDocs,
    query,
    where,
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

        // Prepare the goal data for saving
        const goalToSave = {
            goalName: goalData.goalName,
            targetAmount: Number(goalData.targetAmount),
            currentAmount: Number(goalData.currentAmount) || 0,
            isCompleted: false,
        };

        // Add deadline if provided
        if (goalData.deadline) {
            goalToSave.deadline = goalData.deadline;

            // If timestamp is not provided but deadline is, try to parse the timestamp
            if (
                !goalData.deadlineTimestamp &&
                typeof goalData.deadline === "string"
            ) {
                const dateRegex = /^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})$/;
                const matches = goalData.deadline.match(dateRegex);

                if (matches) {
                    const monthStr = matches[1];
                    const day = parseInt(matches[2]);
                    const year = parseInt(matches[3]);
                    const months = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    const monthIndex = months.indexOf(monthStr);

                    if (monthIndex !== -1) {
                        const date = new Date(year, monthIndex, day);
                        goalToSave.deadlineTimestamp = date.getTime();
                    }
                }
            }
        }

        // Add deadline timestamp if provided
        if (goalData.deadlineTimestamp) {
            goalToSave.deadlineTimestamp = goalData.deadlineTimestamp;
        }

        const docRef = await addDoc(goalsRef, goalToSave);
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

        // First check if the document exists
        const goalDoc = await getDoc(goalRef);
        if (!goalDoc.exists()) {
            console.error(
                `Error updating goal in pushData.js: No document to update with ID ${goalID}`
            );
            return null;
        }

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
        const { category, amount, frequency } = budgetData;
        const convertedAmount = Number(amount);

        const budgetRef = collection(db, "budgets", userID, "settings");
        const q = query(budgetRef, where("category", "==", category));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const existingDoc = querySnapshot.docs[0];
            const docRef = doc(
                db,
                "budgets",
                userID,
                "settings",
                existingDoc.id
            );

            await updateDoc(docRef, {
                amount: convertedAmount,
                frequency,
            });

            return existingDoc.id;
        } else {
            const newDocRef = await addDoc(budgetRef, {
                category,
                amount: convertedAmount,
                frequency,
            });

            return newDocRef.id;
        }
    } catch (error) {
        console.error("Cannot update budget", error);
        throw error;
    }
}

async function addSpending(spendingData, userID) {
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
        const budgetRef = collection(db, "budgets", userID, "settings");
        const querySnapshot = await getDocs(budgetRef);
        const deletePromises = querySnapshot.docs.map((document) => {
            return deleteDoc(
                doc(db, "budgets", userID, "settings", document.id)
            );
        });
        await Promise.all(deletePromises);
        console.log("All budgets reset successfully.");
    } catch (error) {
        console.error("Failed to reset budgets:", error);
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
            if (
                currentData &&
                currentData.currentAmount >= updateData.targetAmount
            ) {
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

            // Ensure that if deadline is updated, we also update the timestamp to match
            if (
                goalData.deadlineTimestamp === undefined &&
                typeof goalData.deadline === "string"
            ) {
                // Try to parse the date from the deadline string
                const dateRegex = /^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})$/;
                const matches = goalData.deadline.match(dateRegex);

                if (matches) {
                    const monthStr = matches[1];
                    const day = parseInt(matches[2]);
                    const year = parseInt(matches[3]);
                    const months = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ];
                    const monthIndex = months.indexOf(monthStr);

                    if (monthIndex !== -1) {
                        const date = new Date(year, monthIndex, day);
                        updateData.deadlineTimestamp = date.getTime();
                    }
                }
            }
        }

        // Save timestamp if provided
        if (goalData.deadlineTimestamp !== undefined) {
            updateData.deadlineTimestamp = goalData.deadlineTimestamp;
        }

        await updateDoc(goalRef, updateData);
        console.log(
            `Goal ${goalID} updated successfully with data:`,
            updateData
        );
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
const mockGoal = {
    goalName: "Emergency Fund",
    targetAmount: 5000,
    currentAmount: 0,
};
const mockUserID = "7bx47gI4c5WuiKj8RsFEbQfUmEm1";
const mockGoalID = "3PQT3jUdWhdfKlI8lSBw";

async function runTest() {
    // Create a new goal first, then update it
    try {
        // First create a goal to get a valid goalID
        const goalID = await addGoal(mockUserID, mockGoal);
        console.log("Created new goal with ID:", goalID);

        // Then update the newly created goal
        if (goalID) {
            await updateGoal(mockUserID, goalID, 300);
        } else {
            console.log("Failed to create goal, cannot update");
        }
    } catch (error) {
        console.error("Test failed:", error);
    }
}

// Comment out the auto-running test to prevent errors
// runTest();
