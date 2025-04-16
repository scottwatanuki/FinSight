// app/services/userInitialization.js
const { db } = require("../../firebase");
const {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    collection,
    getDocs,
} = require("firebase/firestore");

/**
 * Initializes user data structure if it doesn't already exist
 * This is useful for existing Auth users who don't have proper Firestore documents
 */
export const initializeUserIfNeeded = async (userId, userEmail) => {
    try {
        console.log("Checking user initialization for:", userId);

        // Check if user document exists
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        let createdUser = false;

        // Create user document if it doesn't exist
        if (!userDoc.exists()) {
            console.log("Creating user document for:", userId);

            const userData = {
                username: userEmail?.split("@")[0] || "User",
                email: userEmail,
                createdAt: serverTimestamp(),
                profilePicture: "",
            };

            await setDoc(userDocRef, userData);
            createdUser = true;
        }

        // Check if payment methods exist
        const paymentMethodsRef = collection(
            db,
            "users",
            userId,
            "paymentMethods"
        );
        const paymentSnapshot = await getDocs(paymentMethodsRef);

        let createdPayment = false;

        // Create default payment method if none exists
        if (paymentSnapshot.empty) {
            console.log("Creating default payment method for:", userId);

            const paymentData = {
                type: "Amazon Platinum",
                lastFour: "9018",
                name: userEmail?.split("@")[0] || "User",
                balance: 3469.52,
            };

            await setDoc(doc(paymentMethodsRef, "default"), paymentData);
            createdPayment = true;
        }

        // Check if budget exists
        const budgetDocRef = doc(db, "budgets", userId);
        const budgetDoc = await getDoc(budgetDocRef);

        let createdBudget = false;

        // Create budget if it doesn't exist
        if (!budgetDoc.exists()) {
            console.log("Creating budget for:", userId);

            await setDoc(budgetDocRef, {
                bills: 1750,
                food: 200,
                health: 100,
                shopping: 200,
            });

            createdBudget = true;
        }

        return {
            success: true,
            created: {
                user: createdUser,
                payment: createdPayment,
                budget: createdBudget,
            },
        };
    } catch (error) {
        console.error("Error initializing user:", error);
        return { success: false, error: error.message };
    }
};

export default {
    initializeUserIfNeeded,
};
