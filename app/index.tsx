import { Redirect } from "expo-router";
import { useAuth } from "./context/AuthContext";

export default function Index() {
  const { user } = useAuth();

  // Redirect based on authentication status
  return user ? <Redirect href="/(tabs)" /> : <Redirect href="/login" />;
}
