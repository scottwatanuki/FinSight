import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 240,
  strokeWidth = 20,
  color = "#6C63FF",
  bgColor = "#E6E6FA",
  children,
  style,
}) => {
  // Calculate the actual circle dimensions
  const circleSize = size - strokeWidth;
  const radius = circleSize / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate the actual progress for the arc
  // We're using a semi-circle (bottom half) for our visualization
  // so we adjust the percentage to work with half a circle
  const strokeDashoffset =
    circumference - (percentage / 100) * (circumference / 2);

  // Calculate the rotation angle to position the arc correctly
  const rotationAngle = -90 + ((percentage / 100) * 180) / 2;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Background Circle */}
      <View
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: radius,
            borderWidth: strokeWidth,
            borderColor: bgColor,
          },
        ]}
      />

      {/* Progress Arc */}
      <View
        style={[
          styles.arc,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: radius,
            borderWidth: strokeWidth,
            borderTopColor: "transparent",
            borderRightColor: "transparent",
            borderLeftColor: color,
            borderBottomColor: color,
            transform: [{ rotate: `${rotationAngle}deg` }],
            opacity: percentage > 0 ? 1 : 0,
          },
        ]}
      />

      {/* Content inside the circle */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  circle: {
    position: "absolute",
    borderColor: "#E6E6FA",
  },
  arc: {
    position: "absolute",
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    transform: [{ rotate: "-90deg" }],
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
});

export default CircularProgress;