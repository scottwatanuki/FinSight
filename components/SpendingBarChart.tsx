import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from "react-native";
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
import { handleTrackGraphInteraction } from "../firebaseWrapper";

const SpendingBarChart = ({
    data,
    height = 200,
    barWidth = 30,
    spentBarColor = "#6C63FF",
    budgetBarColor = "#ddd",
}) => {
    const [selectedBarIndex, setSelectedBarIndex] = useState(null); // Track selected bar

    const maxValue = Math.max(
        ...data.map((item) => Math.max(item.spent, item.budget))
    );

    const yLabels = ["0"];
    const steps = 3;
    for (let i = 1; i <= steps; i++) {
        const value = Math.round((maxValue / steps) * i);
        yLabels.unshift(
            value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()
        );
    }

    const handleScreenPress = () => {
        setSelectedBarIndex(null);
    };

    const iconDict: { [key: string]: IconSymbolName } = {
        entertainment: "film.fill",
        travel: "airplane",
        bills: "calendar",
        groceries: "cart.fill",
        dining: "fork.knife",
        subscriptions: "newspaper.fill",
        transportation: "car.fill",
        recreational: "gamecontroller.fill",
        shopping: "bag.fill",
        health: "heart.fill",
        misc: "ellipsis",
    };

    return (
        <TouchableWithoutFeedback onPress={handleScreenPress}>
            <View style={styles.container}>
                {/* Y-Axis Labels */}
                <View style={styles.yAxis}>
                    {yLabels.map((label, index) => (
                        <Text key={index} style={styles.yLabel}>
                            {label}
                        </Text>
                    ))}
                </View>

                {/* Chart Area */}
                <View style={[styles.chartArea, { height }]}>
                    {data.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.barGroup}
                            onPress={() => {
                                const newIndex =
                                    selectedBarIndex === index ? null : index;
                                setSelectedBarIndex(newIndex);
                                handleTrackGraphInteraction("Graph pressed");
                            }}
                            activeOpacity={0.8}
                        >
                            <View
                                style={[styles.barColumn, { height: "100%" }]}
                            >
                                {/* Budget Bar */}
                                <View
                                    style={[
                                        styles.budgetBar,
                                        {
                                            height: `${
                                                (item.budget / maxValue) * 100
                                            }%`,
                                            width: barWidth,
                                            backgroundColor: budgetBarColor,
                                        },
                                    ]}
                                />

                                {/* Spent Bar */}
                                <View
                                    style={[
                                        styles.spentBar,
                                        {
                                            height: `${
                                                (item.spent / maxValue) * 100
                                            }%`,
                                            width: barWidth,
                                            backgroundColor: spentBarColor,
                                            position: "absolute",
                                            bottom: 0,
                                        },
                                    ]}
                                />

                                {/* Tooltip for the bar */}
                                {selectedBarIndex === index && (
                                    <View style={styles.tooltip}>
                                        <Text style={styles.tooltipText}>
                                            {item.name}: $
                                            {item.spent.toLocaleString()}
                                        </Text>
                                        <Text style={styles.tooltipText}>
                                            budget: $
                                            {item.budget.toLocaleString()}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Icon for the category */}
                            <IconSymbol
                                name={
                                    iconDict[item.name] || "questionmark.circle"
                                }
                                size={24}
                                color="#666"
                                style={styles.barLabelIcon}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingBottom: 20,
    },
    yAxis: {
        width: 35,
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingRight: 5,
        paddingBottom: 25,
    },
    yLabel: {
        fontSize: 11,
        color: "#999",
    },
    chartArea: {
        marginTop: 20,
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
    },
    barGroup: {
        alignItems: "center",
        flex: 1,
    },
    barColumn: {
        justifyContent: "flex-end",
        alignItems: "center",
        position: "relative",
    },
    budgetBar: {
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        position: "absolute",
        bottom: 0,
    },
    spentBar: {
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    barLabelIcon: {
        marginTop: 8,
    },
    tooltip: {
        position: "absolute",
        bottom: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: 5,
        padding: 8,
        marginBottom: 5,
        width: 120,
        alignSelf: "center",
        zIndex: 10,
    },
    tooltipText: {
        color: "white",
        fontSize: 12,
        textAlign: "center",
        fontWeight: "bold",
    },
});

export default SpendingBarChart;
