// app/services/auth.js
import { auth, db } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const registerUser = async (email, password, username) => {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Log the Auth UID to ensure we're using the correct ID
    console.log("Created user with Auth UID:", user.uid);

    // Create a user document with the SAME ID as the Auth UID
    const userData = {
      username: username || email.split("@")[0],
      email: email,
      createdAt: serverTimestamp(),
      profilePicture: "",
    };

    // Set the user document with the Auth UID
    await setDoc(doc(db, "users", user.uid), userData);
    console.log("Created Firestore user document with ID:", user.uid);

    // Set up default budget with the same user ID
    await setDoc(doc(db, "budgets", user.uid), {
      bills: 1750,
      food: 200,
      health: 100,
      shopping: 200,
    });

    // Add default payment method
    const paymentData = {
      type: "Amazon Platinum",
      lastFour: "9018",
      name: username || email.split("@")[0],
      balance: 3469.52,
    };

    // Create payment method in the subcollection
    await setDoc(
      doc(db, "users", user.uid, "paymentMethods", "default"),
      paymentData
    );

    return { success: true, user };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);

    // Clear persisted user data but keep saved credentials if they exist
    try {
      await AsyncStorage.removeItem("@user");
      // We intentionally don't remove "@savedCredentials" here to support "Remember Me" functionality
    } catch (storageError) {
      console.error("Error clearing user from storage:", storageError);
    }

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Reauthenticate the user with their current password
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);

    // Update the password
    await updatePassword(user, newPassword);

    return { success: true };
  } catch (error) {
    console.error("Password change error:", error);

    // Provide more specific error messages based on Firebase error codes
    if (
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-credential"
    ) {
      return {
        success: false,
        error: "Current password is incorrect. Please check and try again.",
      };
    } else if (error.code === "auth/weak-password") {
      return {
        success: false,
        error:
          "New password is too weak. It should be at least 6 characters long.",
      };
    } else if (error.code === "auth/requires-recent-login") {
      return {
        success: false,
        error:
          "For security reasons, please log out and log back in before changing your password.",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to change password. Please try again.",
    };
  }
};
