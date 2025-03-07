// app/services/userProfile.js
import { db, auth } from "../../firebase";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Update user profile information in Firestore
 */
export const updateUserProfile = async (userId, userData) => {
  try {
    // Explicitly log the user ID being used
    console.log("Updating user profile for ID:", userId);

    // Check if the user document exists first
    const userDoc = await getDoc(doc(db, "users", userId));

    if (userDoc.exists()) {
      // Update existing document
      await updateDoc(doc(db, "users", userId), userData);
    } else {
      // Create new document if it doesn't exist
      console.log("User document doesn't exist, creating new one");
      await setDoc(doc(db, "users", userId), {
        ...userData,
        createdAt: new Date().toISOString(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Add or update a payment method for a user
 */
export const addPaymentMethod = async (
  userId,
  cardData,
  methodId = "default"
) => {
  try {
    // Explicitly log the user ID being used
    console.log("Adding payment method for user ID:", userId);

    await setDoc(
      doc(db, "users", userId, "paymentMethods", methodId),
      cardData
    );
    return { success: true };
  } catch (error) {
    console.error("Error adding payment method:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload profile picture to Firebase Storage and update user profile
 */
export const uploadProfilePicture = async (userId, uri) => {
  try {
    console.log("Starting profile picture upload for user ID:", userId);

    // Convert image URI to blob
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    console.log("Image converted to blob, size:", blob.size);

    // Make sure userId is valid
    if (!userId) {
      throw new Error("Invalid user ID provided");
    }

    // Initialize storage with explicit bucket reference (if needed)
    // If your Firebase project has a custom storage bucket, replace this
    const storage = getStorage();

    // Create a storage reference with a more specific path
    // This helps avoid conflicts and makes debugging easier
    const storageRef = ref(storage, `profilePictures/${userId}_${Date.now()}`);
    console.log("Storage reference created");

    // Upload with metadata
    const metadata = {
      contentType: "image/jpeg", // Explicitly set content type
    };

    console.log("Uploading image to Firebase Storage...");
    const uploadResult = await uploadBytes(storageRef, blob, metadata);
    console.log("Upload successful:", uploadResult.metadata.name);

    // Get download URL with error handling
    try {
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Download URL obtained:", downloadURL);

      // Update user profile with new profile picture URL
      await updateDoc(doc(db, "users", userId), {
        profilePicture: downloadURL,
        lastUpdated: new Date().toISOString(),
      });

      return { success: true, url: downloadURL };
    } catch (urlError) {
      console.error("Error getting download URL:", urlError);
      throw new Error(`Failed to get download URL: ${urlError.message}`);
    }
  } catch (error) {
    console.error("Error uploading profile picture:", error);

    // More detailed error information
    let errorMessage = "Failed to upload profile picture";
    if (error.code) {
      errorMessage += ` (${error.code})`;
    }
    if (error.message) {
      errorMessage += `: ${error.message}`;
    }

    return { success: false, error: errorMessage };
  }
};

/**
 * Get user payment methods
 */
export const getUserPaymentMethods = async (userId) => {
  try {
    const defaultCardDoc = await getDoc(
      doc(db, "users", userId, "paymentMethods", "default")
    );

    if (defaultCardDoc.exists()) {
      return {
        success: true,
        paymentMethod: {
          id: "default",
          ...defaultCardDoc.data(),
        },
      };
    }

    return { success: true, paymentMethod: null };
  } catch (error) {
    console.error("Error getting payment methods:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to add a default payment method if none exists
export const ensureDefaultPaymentMethod = async (userId, userData) => {
  try {
    const methodsRef = collection(db, "users", userId, "paymentMethods");
    const snapshot = await getDocs(methodsRef);

    if (snapshot.empty) {
      // No payment methods exist, create a default one
      const defaultPayment = {
        type: "Visa",
        lastFour: "1234",
        name: userData?.username || "User",
        balance: 3469.52,
      };

      await setDoc(
        doc(db, "users", userId, "paymentMethods", "default"),
        defaultPayment
      );
      return { success: true, created: true, paymentMethod: defaultPayment };
    }

    return { success: true, created: false };
  } catch (error) {
    console.error("Error ensuring default payment method:", error);
    return { success: false, error: error.message };
  }
};

export default {
  updateUserProfile,
  addPaymentMethod,
  uploadProfilePicture,
  getUserPaymentMethods,
  ensureDefaultPaymentMethod,
};
