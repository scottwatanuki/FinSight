import React from "react";
import Signup from "./screens/Signup";
import { SafeAreaView } from "react-native";

export default function SignupScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Signup />
    </SafeAreaView>
  );
}
