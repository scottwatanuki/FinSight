import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../services/auth";
import { useRouter } from "expo-router";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import * as ImagePicker from "expo-image-picker";
import { uploadProfilePicture } from "../services/userProfile";
import imageUtils from "../utils/imageUtils";

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [cardData, setCardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        console.log("Attempting to fetch user data for Auth UID:", user.uid);

        // Fetch user profile data using the Auth UID
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          setUserData(userDoc.data());
          console.log("User data loaded:", userDoc.data());
        } else {
          console.log("No user document found for Auth UID:", user.uid);

          // If document doesn't exist, create it with basic info
          const newUserData = {
            username: user.email?.split("@")[0] || "User",
            email: user.email,
            profilePicture: "",
            createdAt: new Date().toISOString(),
          };

          // This is a fallback - would normally use setupUserProfile
          console.log("Creating new user document with basic data");
          setUserData(newUserData);
        }

        // Fetch payment methods using the Auth UID
        const paymentMethodsRef = collection(
          db,
          "users",
          user.uid,
          "paymentMethods"
        );
        const paymentMethodsSnapshot = await getDocs(paymentMethodsRef);

        if (!paymentMethodsSnapshot.empty) {
          // Use the first payment method found
          const cardDoc = paymentMethodsSnapshot.docs[0];
          setCardData({
            id: cardDoc.id,
            ...cardDoc.data(),
          });
          console.log("Card data loaded:", cardDoc.data());
        } else {
          console.log("No payment methods found for Auth UID:", user.uid);

          // Create a default card object
          setCardData({
            type: "Visa",
            lastFour: "1234",
            name: user.email?.split("@")[0] || "User",
            balance: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load profile data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if (result.success) {
        router.replace("/login");
      } else {
        Alert.alert(
          "Logout Failed",
          result.error || "Failed to log out. Please try again."
        );
      }
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  // Replace the entire handleChangeProfilePicture function in Profile.tsx

  const handleChangeProfilePicture = async () => {
    if (!user) return;

    try {
      // Request permissions for image library
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "You need to grant access to your photos to change your profile picture."
        );
        return;
      }

      // Launch image picker with optimized settings
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6, // Lower quality to reduce size
        maxWidth: 500, // Limit dimensions
        maxHeight: 500,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploading(true);

        try {
          const imageUri = result.assets[0].uri;
          console.log("Selected image:", imageUri);

          // Try to upload to Firebase
          const uploadResult = await uploadProfilePicture(user.uid, imageUri);

          if (uploadResult.success) {
            // Update local state with new profile picture URL
            setUserData((prev) => ({
              ...prev,
              profilePicture: uploadResult.url,
            }));
            Alert.alert("Success", "Profile picture updated successfully!");
          } else {
            // If upload fails, try one more time with even lower quality
            try {
              // Use a different approach - update with a default URL instead
              await updateUserProfile(user.uid, {
                profilePicture:
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
              });

              setUserData((prev) => ({
                ...prev,
                profilePicture:
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
              }));

              Alert.alert(
                "Notice",
                "Image upload failed. We've set a default profile picture instead."
              );
            } catch (error) {
              console.error("Error setting default image:", error);
              Alert.alert(
                "Upload Failed",
                "Could not update profile picture. Please try again later."
              );
            }
          }
        } catch (error) {
          console.error("Error during upload:", error);
          Alert.alert(
            "Upload Error",
            "Failed to upload profile picture. Please try again later."
          );
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Error in image picker:", error);
      setIsUploading(false);
      Alert.alert("Error", "Failed to open image picker. Please try again.");
    }
  };

  // Default values if data isn't loaded yet
  const displayName =
    userData?.username || user?.email?.split("@")[0] || "User";
  const avatarUrl =
    userData?.profilePicture ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

  // Card display data with fallbacks
  const cardType = cardData?.type || "Visa";
  const cardName = cardData?.name || displayName;
  const cardNumber = cardData?.lastFour
    ? `**** **** **** ${cardData.lastFour}`
    : "**** **** **** 1234";
  const cardBalance =
    cardData?.balance !== undefined
      ? `$${cardData.balance.toFixed(2)}`
      : "$3,469.52"; // Default demo value

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4C38CD" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.contentContainer}>
          {/* <Text style={styles.headerTitle}>Profile</Text> */}

          {/* Profile Image and Name */}
          <View style={styles.profileContainer}>
            <TouchableOpacity
              style={styles.profileImageContainer}
              onPress={handleChangeProfilePicture}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="large" color="#4C38CD" />
              ) : (
                <>
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.profileImage}
                  />
                  <View style={styles.editIconContainer}>
                    <Feather name="edit-2" size={16} color="white" />
                  </View>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>

          {/* Card Section with improved design */}
          <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTitle}>Payment Method</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardLeftSection}>
                <Text style={styles.cardName}>{cardName}</Text>
                <Text style={styles.cardType}>{cardType}</Text>
                <Text style={styles.cardNumber}>{cardNumber}</Text>
                <Text style={styles.cardBalance}>{cardBalance}</Text>
              </View>
              <View style={styles.cardRightSection}>
                <Text style={styles.visaText}>VISA</Text>
              </View>
            </View>
          </View>

          {/* Settings Options with improved styling */}
          <View style={styles.optionsContainer}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <TouchableOpacity style={styles.optionItem}>
              <Feather
                name="lock"
                size={22}
                color="#666"
                style={styles.optionIcon}
              />
              <Text style={styles.optionText}>Password</Text>
              <Feather name="chevron-right" size={22} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Feather
                name="credit-card"
                size={22}
                color="#666"
                style={styles.optionIcon}
              />
              <Text style={styles.optionText}>Payment Methods</Text>
              <Feather name="chevron-right" size={22} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Feather
                name="globe"
                size={22}
                color="#666"
                style={styles.optionIcon}
              />
              <Text style={styles.optionText}>Language</Text>
              <Feather name="chevron-right" size={22} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Feather
                name="bell"
                size={22}
                color="#666"
                style={styles.optionIcon}
              />
              <Text style={styles.optionText}>Notifications</Text>
              <Feather name="chevron-right" size={22} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Feather
                name="info"
                size={22}
                color="#666"
                style={styles.optionIcon}
              />
              <Text style={styles.optionText}>About</Text>
              <Feather name="chevron-right" size={22} color="#CCCCCC" />
            </TouchableOpacity>
          </View>

          {/* Logout button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather
              name="log-out"
              size={20}
              color="#FF4444"
              style={styles.logoutIcon}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  scrollView: {
    paddingBottom: 30,
  },
  contentContainer: {
    padding: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4C38CD",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    bottom: 15,
    right: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 36,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    backgroundColor: "#F8F8F8",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  cardContent: {
    flexDirection: "row",
    height: 180,
  },
  cardLeftSection: {
    flex: 6,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#2E1886",
  },
  cardRightSection: {
    flex: 4,
    backgroundColor: "#4C66E0",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 20,
  },
  cardName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardType: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginBottom: 20,
  },
  cardNumber: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
    letterSpacing: 1,
  },
  cardBalance: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  visaText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  debugContainer: {
    marginTop: 20,
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#666",
  },
  debugText: {
    fontSize: 12,
    color: "#666",
  },
  logoutButton: {
    backgroundColor: "#FFEEEE",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: "#FF4444",
    fontSize: 16,
    fontWeight: "bold",
  },
});
