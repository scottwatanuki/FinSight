const { useBottomTabBarHeight } = require( "@react-navigation/bottom-tabs");
const { BlurView } = require( "expo-blur");
const { StyleSheet, View } = require( "react-native");
const { useSafeAreaInsets } = require( "react-native-safe-area-context");

export default function BlurTabBarBackground() {
  return (
    <>
      {/* Add a white background under the blur to ensure consistent appearance */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "white" }]} />
      <BlurView
        // Use light tint instead of system material to ensure consistent appearance in dark mode
        tint="light"
        intensity={100}
        style={StyleSheet.absoluteFill}
      />
    </>
  );
}

export function useBottomTabOverflow() {
  const tabHeight = useBottomTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  return tabHeight - bottom;
}
