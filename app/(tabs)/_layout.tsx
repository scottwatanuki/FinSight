import { Tabs } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Feather } from "@expo/vector-icons";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabsLayout() {
    const { user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();

    useEffect(() => {
        if (!user) {
            router.replace("/login");
        }
    }, [user]);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarInactiveTintColor: "gray",
                // tabBarActiveTintColor: "#4C38CD",
                tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="statistics"
                options={{
                    title: "Budgets",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol
                            size={28}
                            name="creditcard.fill"
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="user" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
