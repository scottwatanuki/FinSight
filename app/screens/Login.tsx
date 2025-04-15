// app/screens/Login.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { loginUser } from "../services/auth";
import { useRouter } from "expo-router";
import userInitialization from "../services/userInitialization";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  const router = useRouter();

  // Load saved credentials when the component mounts
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedCredentials = await AsyncStorage.getItem(
          "@savedCredentials"
        );
        if (savedCredentials) {
          const { email, password, rememberMe } = JSON.parse(savedCredentials);
          if (rememberMe) {
            setEmail(email || "");
            setPassword(password || "");
            setRememberMe(true);
            setHasSavedCredentials(true);
          }
        }
      } catch (error) {
        console.error("Error loading saved credentials:", error);
      }
    };

    loadSavedCredentials();
  }, []);

  const clearSavedCredentials = async () => {
    try {
      await AsyncStorage.removeItem("@savedCredentials");
      setHasSavedCredentials(false);
      setRememberMe(false);
      // Optionally clear the input fields
      setEmail("");
      setPassword("");
      Alert.alert("Success", "Saved credentials have been cleared");
    } catch (error) {
      console.error("Error clearing saved credentials:", error);
      Alert.alert("Error", "Failed to clear saved credentials");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser(email, password);

      if (result.success) {
        // Save credentials if rememberMe is checked
        if (rememberMe) {
          try {
            const credentials = {
              email,
              password,
              rememberMe,
            };
            await AsyncStorage.setItem(
              "@savedCredentials",
              JSON.stringify(credentials)
            );
          } catch (error) {
            console.error("Error saving credentials:", error);
          }
        } else {
          // If rememberMe is unchecked, clear any saved credentials
          try {
            await AsyncStorage.removeItem("@savedCredentials");
          } catch (error) {
            console.error("Error removing saved credentials:", error);
          }
        }

        // Initialize user data after successful login
        try {
          await userInitialization.initializeUserIfNeeded(
            result.user.uid,
            result.user.email
          );
        } catch (error) {
          console.error("Error initializing user data:", error);
          // Continue with navigation even if initialization fails
        }

        // Cache user data in AsyncStorage before navigation
        try {
          const userToCache = {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            emailVerified: result.user.emailVerified,
          };
          await AsyncStorage.setItem("@user", JSON.stringify(userToCache));
        } catch (error) {
          console.error("Error caching user:", error);
        }

        // Add a small delay to ensure auth state is updated
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 100);
      } else {
        Alert.alert("Login Failed");
      }
    } catch (error) {
      Alert.alert(
        "Login Error",
        "An unexpected error occurred. Please try again."
      );
      console.error("Login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Welcome back you've been missed!</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#A0A0A0"
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#A0A0A0"
            editable={!loading}
          />
        </View>

        <View style={styles.credentialsOptionsContainer}>
          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
            disabled={loading}
          >
            <View
              style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            >
              {rememberMe && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.rememberMeText}>Remember me</Text>
          </TouchableOpacity>

          {hasSavedCredentials && (
            <TouchableOpacity
              onPress={clearSavedCredentials}
              disabled={loading}
            >
              <Text style={styles.forgotText}>Clear saved</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.footerLink}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4C38CD",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#000",
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: {
    backgroundColor: "#F0F0FF",
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: "#333",
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  credentialsOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#4C38CD",
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4C38CD",
  },
  checkmark: {
    color: "white",
    fontSize: 14,
  },
  rememberMeText: {
    fontSize: 16,
    color: "#666",
  },
  button: {
    backgroundColor: "#4C38CD",
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#A5A5A5",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    color: "#666",
  },
  footerLink: {
    fontSize: 16,
    color: "#4C38CD",
    fontWeight: "500",
  },
  forgotText: {
    fontSize: 16,
    color: "#4C38CD",
    fontWeight: "500",
  },
});
