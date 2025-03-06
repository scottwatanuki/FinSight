// app/services/setupUserProfile.js
import { db } from "../../firebase";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";

/**
 * Setup a new user profile with payment method after registration
 */
export const setupUserProfile = async (
  userId,
  userData,
  paymentData = null
) => {
  try {
    // Default user data
    const defaultUserData = {
      username: userData.email?.split("@")[0] || "User",
      email: userData.email,
      createdAt: serverTimestamp(),
      profilePicture: "",
    };

    // Merge with provided user data
    const mergedUserData = { ...defaultUserData, ...userData };

    // Create user document
    await setDoc(doc(db, "users", userId), mergedUserData);

    // Set up default budget - using userId as the doc ID
    await setDoc(doc(db, "budgets", userId), {
      bills: 1750,
      food: 200,
      health: 100,
      shopping: 200,
    });

    // Create spending_history structure with empty category collections
    const spending_history_ref = doc(db, "spending_history", userId);

    // Create category subcollections under spending_history
    const categories = ["bills", "food", "health", "shopping"];
    // We only need to create the structure, no need to add documents yet

    // Add default payment method if provided
    if (paymentData) {
      // Default payment data
      const defaultPaymentData = {
        type: "Visa",
        lastFour: "1234",
        name: mergedUserData.username,
        balance: 3469.52,
      };

      // Merge with provided payment data
      const mergedPaymentData = { ...defaultPaymentData, ...paymentData };

      // Create payment method document with auto ID
      const paymentMethodsRef = collection(
        db,
        "users",
        userId,
        "paymentMethods"
      );
      await setDoc(doc(paymentMethodsRef), mergedPaymentData);
    }

    return { success: true };
  } catch (error) {
    console.error("Error setting up user profile:", error);
    return { success: false, error: error.message };
  }
};

export default setupUserProfile;
