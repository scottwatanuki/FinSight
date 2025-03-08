import React from "react";
import Signup from "./screens/Signup";
import { SafeAreaView, StyleSheet } from "react-native";

export default function SignupScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Signup />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});