import { Redirect } from "expo-router";
import { useAuth } from "./context/AuthContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const { user, loading } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const [cachedAuth, setCachedAuth] = useState(null);

  // Check for cached auth state on initial load
  useEffect(() => {
    const checkCachedAuth = async () => {
      try {
        const cachedUser = await AsyncStorage.getItem("@user");
        if (cachedUser) {
          setCachedAuth(JSON.parse(cachedUser));
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
      setInitializing(false);
    }
  }, [loading]);

  // Show loading screen while checking auth state
  if (loading || initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4C38CD" />
      </View>
    );
  }

  // Use cached auth if available and still loading the user
  const isAuthenticated = user || cachedAuth;

  // Redirect based on authentication status
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
