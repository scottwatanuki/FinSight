import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

interface AutomationSetting {
  threshold?: number;
  percentage?: number;
  minAmount?: number;
  categories?: string[];
  winter?: {
    increase: string[];
    decrease: string[];
  };
  summer?: {
    increase: string[];
    decrease: string[];
  };
}

interface Automation {
  id: number;
  title: string;
  description: string;
  enabled: boolean;
  settings: AutomationSetting;
}

export default function BudgetAutomation() {
  const router = useRouter();
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: 1,
      title: "Smart Budget Adjustment",
      description:
        "Automatically adjust your monthly budget based on your spending patterns",
      enabled: true,
      settings: {
        threshold: 15,
        categories: ["Food", "Transportation", "Shopping"],
      },
    },
    {
      id: 2,
      title: "Savings Accelerator",
      description:
        "Automatically move unspent budget to savings at the end of the month",
      enabled: false,
      settings: {
        percentage: 100,
        minAmount: 50,
      },
    },
    {
      id: 3,
      title: "Expense Anomaly Detection",
      description: "Get notified when spending in a category is unusually high",
      enabled: true,
      settings: {
        threshold: 20,
        categories: ["Bills", "Entertainment", "Dining"],
      },
    },
    {
      id: 4,
      title: "Seasonal Budget Adjustments",
      description:
        "Automatically adjust budgets for seasonal spending patterns",
      enabled: false,
      settings: {
        winter: {
          increase: ["Utilities", "Shopping"],
          decrease: ["Entertainment", "Dining"],
        },
        summer: {
          increase: ["Travel", "Entertainment"],
          decrease: ["Utilities", "Shopping"],
        },
      },
    },
  ]);

  const toggleAutomation = (id: number) => {
    setAutomations(
      automations.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const updateSetting = (
    id: number,
    settingPath: string,
    value: number | string
  ) => {
    setAutomations(
      automations.map((item) => {
        if (item.id === id) {
          const newItem = { ...item };
          const pathParts = settingPath.split(".");
          let current = newItem.settings as any;

          for (let i = 0; i < pathParts.length - 1; i++) {
            current = current[pathParts[i]];
          }

          current[pathParts[pathParts.length - 1]] = value;
          return newItem;
        }
        return item;
      })
    );
  };

  const renderAutomationCard = (automation: Automation) => {
    return (
      <View key={automation.id} style={styles.automationCard}>
        <View style={styles.automationHeader}>
          <View style={styles.automationTitleContainer}>
            <Text style={styles.automationTitle}>{automation.title}</Text>
            <Text style={styles.automationDescription}>
              {automation.description}
            </Text>
          </View>
          <Switch
            value={automation.enabled}
            onValueChange={() => toggleAutomation(automation.id)}
            trackColor={{ false: "#E0E0E0", true: "#4C38CD44" }}
            thumbColor={automation.enabled ? "#4C38CD" : "#FFF"}
          />
        </View>

        {automation.enabled && (
          <View style={styles.settingsContainer}>
            {automation.id === 1 && (
              <>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Adjustment Threshold</Text>
                  <View style={styles.settingInputContainer}>
                    <TextInput
                      style={styles.settingInput}
                      value={automation.settings.threshold?.toString() || ""}
                      onChangeText={(value) =>
                        updateSetting(
                          automation.id,
                          "threshold",
                          parseInt(value) || 0
                        )
                      }
                      keyboardType="numeric"
                    />
                    <Text style={styles.settingUnit}>%</Text>
                  </View>
                </View>
                <Text style={styles.settingDescription}>
                  Budgets will adjust when your spending is this percentage
                  above or below the budget for 3 consecutive months
                </Text>

                <View style={styles.categoriesContainer}>
                  <Text style={styles.settingLabel}>Applied Categories</Text>
                  <View style={styles.categoriesList}>
                    {automation.settings.categories?.map((category, index) => (
                      <View key={index} style={styles.categoryTag}>
                        <Text style={styles.categoryTagText}>{category}</Text>
                      </View>
                    ))}
                    <TouchableOpacity style={styles.addCategoryButton}>
                      <Feather name="plus" size={16} color="#4C38CD" />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {automation.id === 2 && (
              <>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Transfer Percentage</Text>
                  <View style={styles.settingInputContainer}>
                    <TextInput
                      style={styles.settingInput}
                      value={automation.settings.percentage?.toString() || ""}
                      onChangeText={(value) =>
                        updateSetting(
                          automation.id,
                          "percentage",
                          parseInt(value) || 0
                        )
                      }
                      keyboardType="numeric"
                    />
                    <Text style={styles.settingUnit}>%</Text>
                  </View>
                </View>
                <Text style={styles.settingDescription}>
                  Percentage of unspent budget to transfer to savings
                </Text>

                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Minimum Amount</Text>
                  <View style={styles.settingInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.settingInput}
                      value={automation.settings.minAmount?.toString() || ""}
                      onChangeText={(value) =>
                        updateSetting(
                          automation.id,
                          "minAmount",
                          parseInt(value) || 0
                        )
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <Text style={styles.settingDescription}>
                  Only transfer if unspent amount is greater than this value
                </Text>
              </>
            )}

            {automation.id === 3 && (
              <>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Alert Threshold</Text>
                  <View style={styles.settingInputContainer}>
                    <TextInput
                      style={styles.settingInput}
                      value={automation.settings.threshold?.toString() || ""}
                      onChangeText={(value) =>
                        updateSetting(
                          automation.id,
                          "threshold",
                          parseInt(value) || 0
                        )
                      }
                      keyboardType="numeric"
                    />
                    <Text style={styles.settingUnit}>%</Text>
                  </View>
                </View>
                <Text style={styles.settingDescription}>
                  Send alert when spending exceeds this percentage above your
                  average
                </Text>

                <View style={styles.categoriesContainer}>
                  <Text style={styles.settingLabel}>Monitored Categories</Text>
                  <View style={styles.categoriesList}>
                    {automation.settings.categories?.map((category, index) => (
                      <View key={index} style={styles.categoryTag}>
                        <Text style={styles.categoryTagText}>{category}</Text>
                      </View>
                    ))}
                    <TouchableOpacity style={styles.addCategoryButton}>
                      <Feather name="plus" size={16} color="#4C38CD" />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {automation.id === 4 && (
              <>
                <View style={styles.settingSection}>
                  <Text style={styles.settingSectionTitle}>
                    Winter Adjustments
                  </Text>

                  <Text style={styles.settingSubLabel}>Increase Budget</Text>
                  <View style={styles.categoriesList}>
                    {automation.settings.winter?.increase.map(
                      (category, index) => (
                        <View key={index} style={styles.categoryTag}>
                          <Text style={styles.categoryTagText}>{category}</Text>
                        </View>
                      )
                    )}
                  </View>

                  <Text style={styles.settingSubLabel}>Decrease Budget</Text>
                  <View style={styles.categoriesList}>
                    {automation.settings.winter?.decrease.map(
                      (category, index) => (
                        <View key={index} style={styles.categoryTag}>
                          <Text style={styles.categoryTagText}>{category}</Text>
                        </View>
                      )
                    )}
                  </View>
                </View>

                <View style={styles.settingSection}>
                  <Text style={styles.settingSectionTitle}>
                    Summer Adjustments
                  </Text>

                  <Text style={styles.settingSubLabel}>Increase Budget</Text>
                  <View style={styles.categoriesList}>
                    {automation.settings.summer?.increase.map(
                      (category, index) => (
                        <View key={index} style={styles.categoryTag}>
                          <Text style={styles.categoryTagText}>{category}</Text>
                        </View>
                      )
                    )}
                  </View>

                  <Text style={styles.settingSubLabel}>Decrease Budget</Text>
                  <View style={styles.categoriesList}>
                    {automation.settings.summer?.decrease.map(
                      (category, index) => (
                        <View key={index} style={styles.categoryTag}>
                          <Text style={styles.categoryTagText}>{category}</Text>
                        </View>
                      )
                    )}
                  </View>
                </View>

                <Text style={styles.settingDescription}>
                  Budget adjustments will be applied automatically based on
                  seasonal patterns
                </Text>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budget Automation</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Feather name="help-circle" size={24} color="#4C38CD" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.banner}>
          <Feather name="zap" size={24} color="#FFFFFF" />
          <Text style={styles.bannerTitle}>Smart Budgeting</Text>
          <Text style={styles.bannerText}>
            Let AI handle your budget adjustments based on your spending habits
            and financial goals
          </Text>
        </View>

        <View style={styles.automationsContainer}>
          <Text style={styles.sectionTitle}>Available Automations</Text>
          <Text style={styles.sectionDescription}>
            Enable the automations you want to use. You can adjust their
            settings anytime.
          </Text>

          {automations.map(renderAutomationCard)}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Feather
              name="info"
              size={22}
              color="#4C38CD"
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              All automations run at the end of each month. You'll receive
              notifications before any changes are made.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  headerAction: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  banner: {
    backgroundColor: "#4C38CD",
    padding: 20,
    alignItems: "center",
    margin: 20,
    borderRadius: 16,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginVertical: 10,
  },
  bannerText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
  },
  automationsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 20,
  },
  automationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  automationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  automationTitleContainer: {
    flex: 1,
    marginRight: 15,
  },
  automationTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  automationDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  settingsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: "#F0F0F0",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  settingDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 20,
  },
  settingInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  currencySymbol: {
    fontSize: 16,
    color: "#666666",
    marginRight: 5,
  },
  settingInput: {
    width: 50,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: "center",
  },
  settingUnit: {
    fontSize: 16,
    color: "#666666",
    marginLeft: 5,
  },
  categoriesContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  categoriesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  categoryTag: {
    backgroundColor: "#F3F1FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryTagText: {
    fontSize: 14,
    color: "#4C38CD",
  },
  addCategoryButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#4C38CD",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  settingSection: {
    marginBottom: 20,
  },
  settingSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  settingSubLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
    marginTop: 8,
    marginBottom: 5,
  },
  infoSection: {
    padding: 20,
    paddingTop: 0,
  },
  infoCard: {
    backgroundColor: "#F3F1FF",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#333333",
  },
});
