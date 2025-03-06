import { db } from "../../firebase";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const updateUserProfile = async (userId, userData) => {
  try {
    await updateDoc(doc(db, "users", userId), userData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const addPaymentMethod = async (userId, cardData) => {
  try {
    await setDoc(
      doc(db, "users", userId, "paymentMethods", "default"),
      cardData
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const uploadProfilePicture = async (userId, uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storage = getStorage();
    const storageRef = ref(storage, `profilePictures/${userId}`);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    await updateUserProfile(userId, { profilePicture: downloadURL });

    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const userProfileService = {
  updateUserProfile,
  addPaymentMethod,
  uploadProfilePicture,
};

export default userProfileService;
