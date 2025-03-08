import React from "react";
import Login from "./screens/Login";
import { SafeAreaView, StyleSheet } from "react-native";

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Login />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});