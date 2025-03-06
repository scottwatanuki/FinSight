import React from "react";
import Login from "./screens/Login";
import { SafeAreaView } from "react-native";

export default function LoginScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Login />
    </SafeAreaView>
  );
}
