import { Stack } from "expo-router";
import { AuthProvider } from "./context/AuthContext";
import { useRouter } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="change-password" />
      </Stack>
    </AuthProvider>
  );
}
