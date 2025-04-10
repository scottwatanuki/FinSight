import React from "react";
import { SafeAreaView } from "react-native";
import Profile from "../screens/Profile";

export default function ProfileTab() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Profile />
    </SafeAreaView>
  );
}