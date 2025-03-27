import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  rotation?: number;
  useDynamicColor?: boolean;
}

// Helper function to determine color based on percentage
const getBudgetColor = (percentage: number): string => {
  if (percentage <= 50) {
    return "#4CAF50"; // Green for good (under 50%)
  } else if (percentage <= 80) {
    return "#FFA726"; // Orange for warning (50-80%)
  } else {
    return "#F44336"; // Red for over budget (above 80%)
  }
};

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 240,
  strokeWidth = 20,
  color = "#6C63FF",
  bgColor = "#E6E6FA",
  children,
  style,
  rotation = -90, // Default to -90 to start from top (north)
  useDynamicColor = false, // Default to not use dynamic coloring
}) => {
  // Calculate the SVG dimensions and values
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate the stroke dashoffset based on the percentage
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Use dynamic color if requested
  const progressColor = useDynamicColor ? getBudgetColor(percentage) : color;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* SVG Circle Progress */}
      <Svg width={size} height={size} style={styles.svg}>
        <G rotation={rotation} origin={`${center}, ${center}`}>
          {/* Background Circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Progress Circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      
      {/* Content in the center of the circle */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  svg: {
    position: "absolute",
  },
  content: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CircularProgress;
