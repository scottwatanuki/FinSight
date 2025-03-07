import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../services/auth";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { Feather } from "@expo/vector-icons";

export default function Settings() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [cardData, setCardData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        // Fetch card data if it exists
        const cardDoc = await getDoc(
          doc(db, "users", user.uid, "paymentMethods", "default")
        );
        if (cardDoc.exists()) {
          setCardData(cardDoc.data());
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  };

  // Default profile data if real data is not available
  const displayName = userData?.username || "Brie Larson";
  const avatarUrl =
    userData?.profilePicture || "https://via.placeholder.com/150";
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

          {/* User Info Section */}
          <View style={styles.profileContainer}>
            <Image source={{ uri: avatarUrl }} style={styles.profileImage} />
            <Text style={styles.profileName}>{displayName}</Text>
          </View>

          {/* Card Section */}
          <View style={styles.cardContainer}>
            <View style={styles.cardContent}>
              <View>
                <Text style={styles.cardName}>{displayName}</Text>
                <Text style={styles.cardType}>{cardType}</Text>
                <Text style={styles.cardNumber}>{cardNumber}</Text>
                <Text style={styles.cardBalance}>{cardBalance}</Text>
              </View>
              <View style={styles.visaContainer}>
                <Text style={styles.visaText}>VISA</Text>
              </View>
            </View>
          </View>

          {/* Settings Options */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionItem}>
              <Text style={styles.optionText}>Password</Text>
              <Feather name="chevron-right" size={24} color="gray" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Text style={styles.optionText}>Bank</Text>
              <Feather name="chevron-right" size={24} color="gray" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Text style={styles.optionText}>Languages</Text>
              <Feather name="chevron-right" size={24} color="gray" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Text style={styles.optionText}>App information</Text>
              <Feather name="chevron-right" size={24} color="gray" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Feather name="home" size={24} color="gray" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="credit-card" size={24} color="gray" />
          <Text style={styles.tabText}>Cards</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Feather name="user" size={24} color="#4C38CD" />
          <Text style={[styles.tabText, styles.activeTabText]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    paddingBottom: 80, // Space for the tab bar
  },
  contentContainer: {
    padding: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  cardContainer: {
    backgroundColor: "#2E1886", // Deep indigo/purple
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  cardType: {
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 16,
  },
  cardNumber: {
    color: "white",
    fontSize: 18,
  },
  cardBalance: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },
  visaContainer: {
    justifyContent: "flex-end",
  },
  visaText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
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
  optionText: {
    fontSize: 18,
  },
  logoutButton: {
    backgroundColor: "#FFEEEE",
    borderRadius: 8,
    padding: 14,
    marginTop: 20,
    alignItems: "center",
  },
  logoutText: {
    color: "#FF4444",
    fontSize: 16,
    fontWeight: "bold",
  },
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 10,
  },
  tabItem: {
    alignItems: "center",
  },
  tabText: {
    marginTop: 4,
    fontSize: 12,
    color: "gray",
  },
  activeTabText: {
    color: "#4C38CD",
  },
});
