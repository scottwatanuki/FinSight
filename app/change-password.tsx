import React from "react";
import { SafeAreaView } from "react-native";
import ChangePassword from "./screens/ChangePassword";

export default function ChangePasswordRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ChangePassword />
    </SafeAreaView>
  );
}
