import React, { useState, useEffect, useRef } from "react";
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
  Modal,
  Pressable,
  Button,
} from "react-native";
import { Feather, AntDesign, FontAwesome6 } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../services/auth";
import { useRouter } from "expo-router";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import * as ImagePicker from "expo-image-picker";
import { uploadProfilePicture } from "../services/userProfile";
import * as FileSystem from "expo-file-system";
import {
  Camera,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";

// -----------------------------------------------------
// CardScannerModal
// This component shows the camera view inside a modal.
// When a picture is taken, it extracts card details using OCR.
function CardScannerModal({ visible, onClose, onCardScanned }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState<CameraType>("back");

  // If the permission hasn't been determined yet
  if (!permission) {
    return null;
  }

  // If permission is not granted, show a prompt
  if (!permission.granted) {
    return (
      <View style={[styles.modalContainer, styles.centered]}>
        <Text style={{ textAlign: "center", color: "white", marginBottom: 12 }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync();
      if (photo?.uri) {
        const result = await extractCardNumberFromImage(photo.uri);
        // Pass the extracted card data back to Profile
        onCardScanned(result);
        onClose();
      }
    } catch (err) {
      console.error("Error taking picture:", err);
      Alert.alert("Error", "Could not take picture. Please try again.");
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <CameraView
          style={styles.camera}
          type={facing}
          ref={cameraRef}
          ratio="16:9"
        >
          <View style={styles.shutterContainer}>
            <Pressable onPress={takePicture}>
              <View style={styles.shutterBtn}>
                <View style={styles.shutterBtnInner} />
              </View>
            </Pressable>
          </View>
        </CameraView>
        <Button title="Cancel" onPress={onClose} />
      </View>
    </Modal>
  );
}

// -----------------------------------------------------
// OCR Helper Function
// This function reads the image as base64 and sends it to the Google Vision API.
async function extractCardNumberFromImage(uri: string) {
  console.log("🖼️ Image URI:", uri);
  console.log("📦 Reading image as base64...");

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  console.log("📦 Base64 length:", base64.length);

  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const apiKey = "AIzaSyCLspCimLs5Xuwu3it0jDQX3wxNlWHL5eU"; // Replace with your actual key
    const body = JSON.stringify({
      requests: [
        {
          image: { content: base64 },
          features: [{ type: "TEXT_DETECTION" }],
        },
      ],
    });

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }
    );

    const result = await response.json();
    const ocrText =
      result.responses?.[0]?.textAnnotations?.[0]?.description || "";
    console.log(
      "📨 Raw Google Vision API result:",
      JSON.stringify(result, null, 2)
    );
    // 👇 LOG the raw OCR text so we can debug
    console.log("📃 OCR Raw Text:\n", ocrText);

    // Try multiple RegEx formats
    const cardNumberMatch = ocrText.match(/\b(?:\d[ -]*?){13,16}\b/);
    const expiryMatch = ocrText.match(/\b(0[1-9]|1[0-2])\/?([0-9]{2})\b/);
    console.log("cardNumberMatch", cardNumberMatch);
    console.log("expiryMatch", expiryMatch);

    return {
      cardNumber: cardNumberMatch?.[0]?.replace(/[^\d]/g, "") || null,
      expiry: expiryMatch ? `${expiryMatch[1]}/${expiryMatch[2]}` : null,
    };
  } catch (err) {
    console.error("❌ OCR Error:", err);
    return { cardNumber: null, expiry: null };
  }
}

// -----------------------------------------------------
// Profile Component
export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [cardData, setCardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showCardScanner, setShowCardScanner] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching user data for UID:", user.uid);
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          setUserData(userDoc.data());
          console.log("User data loaded:", userDoc.data());
        } else {
          console.log("No user document found for UID:", user.uid);
          const newUserData = {
            username: user.email?.split("@")[0] || "User",
            email: user.email,
            profilePicture: "",
            createdAt: new Date().toISOString(),
          };
          console.log("Creating new user document with basic data");
          setUserData(newUserData);
        }

        // Fetch payment methods (or use a default if not found)
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
          console.log("No payment methods found for UID:", user.uid);
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

  const handleChangeProfilePicture = async () => {
    if (!user) return;
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "You need to grant access to your photos to change your profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        maxWidth: 500,
        maxHeight: 500,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploading(true);
        try {
          const imageUri = result.assets[0].uri;
          console.log("Selected image:", imageUri);
          const uploadResult = await uploadProfilePicture(user.uid, imageUri);
          if (uploadResult.success) {
            setUserData((prev) => ({
              ...prev,
              profilePicture: uploadResult.url,
            }));
            Alert.alert("Success", "Profile picture updated successfully!");
          } else {
            Alert.alert(
              "Upload Failed",
              "Could not update profile picture. Please try again later."
            );
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

  // Callback when a card is scanned in the CardScannerModal.
  const handleCardScanned = (result) => {
    if (result.cardNumber) {
      // Update the card data—here we update the "lastFour" and add an "expiry" field.
      setCardData((prev) => ({
        ...prev,
        cardNumber: result.cardNumber,
        lastFour: result.cardNumber.slice(-4),
        expiry: result.expiry,
      }));
      Alert.alert("Card Scanned", "Card details updated successfully.");
    } else {
      Alert.alert(
        "Scan Failed",
        "Could not extract card details. Please try again."
      );
    }
  };

  // Default display values if data is not loaded yet.
  const displayName =
    userData?.username || user?.email?.split("@")[0] || "User";
  const avatarUrl =
    userData?.profilePicture ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

  // Card display values
  const cardName = cardData?.name || displayName;
  const cardType = cardData?.type || "Visa";
  // If a full card number was scanned, display that; otherwise show a default masked number.
  const cardNumber = cardData?.cardNumber
    ? cardData.cardNumber
    : cardData?.lastFour
    ? `**** **** **** ${cardData.lastFour}`
    : "**** **** **** 1234";
  const cardBalance =
    cardData?.balance !== undefined
      ? `$${cardData.balance.toFixed(2)}`
      : "$3,469.52"; // Demo default value

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

          {/* Card Section */}
          <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTitle}>Your Card</Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardLeftSection}>
                <Text style={styles.cardName}>{cardName}</Text>
                <Text style={styles.cardNumber}>{cardNumber}</Text>
                {cardData?.expiry && (
                  <Text style={styles.cardExpiry}>
                    Expiry: {cardData.expiry}
                  </Text>
                )}
              </View>
              <View style={styles.cardRightSection}>
                <Text style={styles.visaText}>VISA</Text>
              </View>
            </View>
          </View>

          {/* Settings Options */}
          <View style={styles.optionsContainer}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => router.push("/premium")}
            >
              <Feather
                name="star"
                size={22}
                color="#FFC107"
                style={styles.optionIcon}
              />
              <Text style={styles.optionText}>Premium</Text>
              <View style={styles.newFeatureBadge}>
                <Text style={styles.newFeatureText}>NEW</Text>
              </View>
              <Feather name="chevron-right" size={22} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => router.push("/change-password")}
            >
              <Feather
                name="lock"
                size={22}
                color="#666"
                style={styles.optionIcon}
              />
              <Text style={styles.optionText}>Password</Text>
              <Feather name="chevron-right" size={22} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => setShowCardScanner(true)}
            >
              <Feather
                name="credit-card"
                size={22}
                color="#666"
                style={styles.optionIcon}
              />
              <Text style={styles.optionText}>Add a Card</Text>
              <Feather name="chevron-right" size={22} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Notification preferences will be available in the next update."
                )
              }
            >
              <Feather
                name="bell"
                size={22}
                color="#666"
                style={styles.optionIcon}
              />
              <Text style={styles.optionText}>Notifications</Text>
              <Feather name="chevron-right" size={22} color="#CCCCCC" />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
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
      {/* Include the CardScannerModal */}
      <CardScannerModal
        visible={showCardScanner}
        onClose={() => setShowCardScanner(false)}
        onCardScanned={handleCardScanned}
      />
    </SafeAreaView>
  );
}

// -----------------------------------------------------
// Styles
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
    bottom: 15,
    right: 15,
    backgroundColor: "#4C38CD",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
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
    flex: 10,
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
  cardExpiry: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
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
  // Styles for the CardScannerModal and Camera view
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 160,
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: "white",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  newFeatureBadge: {
    backgroundColor: "#4C38CD",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 10,
  },
  newFeatureText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});