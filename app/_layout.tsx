import { Stack } from "expo-router";
import { useEffect } from "react";
import "../firebase"; // Import your Firebase configuration

export default function Layout() {
    // Initialize any app-wide configurations here

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#f5f5f5",
                },
                headerTintColor: "#333",
                headerTitleStyle: {
                    fontWeight: "bold",
                },
            }}
        />
    );
}
