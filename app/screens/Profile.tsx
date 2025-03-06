// app/screens/Profile.tsx - Updated with better styling and dummy image
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../services/auth";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [cardData, setCardData] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }

          const cardDoc = await getDoc(
            doc(db, "users", user.uid, "paymentMethods", "default")
          );
          if (cardDoc.exists()) {
            setCardData(cardDoc.data());
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if (result.success) {
        router.replace("/login");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Default profile data with a better placeholder image
  const displayName = userData?.username || "Brie Larson";
  const avatarUrl =
    userData?.profilePicture || "https://i.pravatar.cc/300?img=5";
  const cardType = cardData?.type || "Amazon Platinium";
  const cardNumber = cardData?.lastFour
    ? `4756 **** **** ${cardData.lastFour}`
    : "4756 **** **** 9018";
  const cardBalance = cardData?.balance
    ? `$${cardData.balance.toFixed(2)}`
    : "$3,469.52";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.contentContainer}>
          <Text style={styles.headerTitle}>Settings</Text>

          {/* Profile Image and Name */}
          <View style={styles.profileContainer}>
            <View style={styles.profileImageContainer}>
              <Image source={{ uri: avatarUrl }} style={styles.profileImage} />
            </View>
            <Text style={styles.profileName}>{displayName}</Text>
          </View>

          {/* Card Section with improved design */}
          <View style={styles.cardContainer}>
            <View style={styles.cardLeftSection}>
              <Text style={styles.cardName}>{displayName}</Text>
              <Text style={styles.cardType}>{cardType}</Text>
              <Text style={styles.cardNumber}>{cardNumber}</Text>
              <Text style={styles.cardBalance}>{cardBalance}</Text>
            </View>
            <View style={styles.cardRightSection}>
              <Text style={styles.visaText}>VISA</Text>
            </View>
          </View>

          {/* Settings Options with improved styling */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionItem}>
              <Text style={styles.optionText}>Password</Text>
              <Feather name="chevron-right" size={24} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Text style={styles.optionText}>Bank</Text>
              <Feather name="chevron-right" size={24} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Text style={styles.optionText}>Languages</Text>
              <Feather name="chevron-right" size={24} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Text style={styles.optionText}>App information</Text>
              <Feather name="chevron-right" size={24} color="#CCCCCC" />
            </TouchableOpacity>
          </View>

          {/* Logout button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
  scrollView: {
    paddingBottom: 30,
  },
  contentContainer: {
    padding: 24,
  },
  headerTitle: {
    fontSize: 28,
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
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  cardContainer: {
    flexDirection: "row",
    backgroundColor: "#2E1886",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 36,
    height: 200,
  },
  cardLeftSection: {
    flex: 6,
    padding: 24,
    justifyContent: "center",
  },
  cardRightSection: {
    flex: 4,
    backgroundColor: "#4C66E0",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 24,
  },
  cardName: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardType: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    marginBottom: 20,
  },
  cardNumber: {
    color: "white",
    fontSize: 18,
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
  optionsContainer: {
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  optionText: {
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: "#FFEEEE",
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    alignItems: "center",
  },
  logoutText: {
    color: "#FF4444",
    fontSize: 16,
    fontWeight: "bold",
  },
});
