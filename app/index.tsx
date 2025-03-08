import { Redirect } from "expo-router";
import { useAuth } from "./context/AuthContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const { user, loading } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const [cachedAuth, setCachedAuth] = useState(null);

  useEffect(() => {
    const checkCachedAuth = async () => {
      try {
        const cachedUser = await AsyncStorage.getItem("@user");
        
        if (cachedUser) {
          setCachedAuth(JSON.parse(cachedUser));
          console.log("Using cached auth data for initial routing");
        }
      } catch (error) {
        console.error("Error reading cached auth:", error);
      } finally {
        setInitializing(false);
      }
    };

    if (loading) {
      checkCachedAuth();
    } else {
      console.log(
        "Auth state updated, user:",
        user ? "authenticated" : "not authenticated"
      );
      setInitializing(false);
    }
  }, [loading, user]);

  if (loading || initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4C38CD" />
      </View>
    );
  }

  const isAuthenticated = user || cachedAuth;
  
  return isAuthenticated ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href="/login" />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});