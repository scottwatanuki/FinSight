import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, parse, isValid } from "date-fns";
const {
  updateGoal,
  deleteGoal,
  updateGoalDetails,
} = require("../backend/pushData");

const SavingsGoalCard = ({
  title = "New Car",
  currentAmount = 3500,
  targetAmount = 15000,
  deadline = "Dec 2023",
  onPress,
  goalId,
  isCompleted = false,
  onGoalDeleted,
  onGoalUpdated,
}) => {
  const { user } = useAuth();
  const [addFundsModalVisible, setAddFundsModalVisible] = useState(false);
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState("100");

  // Edit goal state
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedTargetAmount, setEditedTargetAmount] = useState(
    targetAmount.toString()
  );
  const [editedDeadline, setEditedDeadline] = useState(deadline);
  const [displayDeadline, setDisplayDeadline] = useState(deadline);

  // Update local state when props change
  useEffect(() => {
    setEditedTitle(title);
    setEditedTargetAmount(targetAmount.toString());
    setEditedDeadline(deadline);
    setDisplayDeadline(deadline);
  }, [title, targetAmount, deadline]);

  // Format date for display
  const formatDate = (date) => {
    try {
      // Use date-fns for consistent formatting
      return format(date, "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      // Fallback to manual formatting
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month} ${day}, ${year}`;
    }
  };

  // Date parser - convert string date to Date object
  const parseDeadline = (deadlineStr) => {
    try {
      // Try to parse with date-fns
      // Try different formats
      let parsedDate;

      // Try MMM d, yyyy (e.g., Apr 15, 2025)
      parsedDate = parse(deadlineStr, "MMM d, yyyy", new Date());
      if (isValid(parsedDate)) return parsedDate;

      // Try MMM yyyy (e.g., Apr 2025)
      parsedDate = parse(deadlineStr, "MMM yyyy", new Date());
      if (isValid(parsedDate)) return parsedDate;

      // Log for debugging
      console.log("Failed to parse with date-fns:", deadlineStr);

      // Fallback to regex parsing for older formats
      const fullDateRegex = /^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})$/;
      let match = deadlineStr.match(fullDateRegex);

      if (match) {
        const monthStr = match[1];
        const day = parseInt(match[2]);
        const year = parseInt(match[3]);
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const monthIndex = months.indexOf(monthStr);
        if (monthIndex !== -1 && !isNaN(day) && !isNaN(year)) {
          return new Date(year, monthIndex, day);
        }
      }

      // Check if it's in the old format "MMM YYYY"
      const oldFormatRegex = /^([A-Za-z]{3})\s+(\d{4})$/;
      match = deadlineStr.match(oldFormatRegex);

      if (match) {
        const monthStr = match[1];
        const year = parseInt(match[2]);
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const monthIndex = months.indexOf(monthStr);
        if (monthIndex !== -1 && !isNaN(year)) {
          return new Date(year, monthIndex, 1);
        }
      }
    } catch (error) {
      console.error("Error parsing date:", error, deadlineStr);
    }

    // Default to current date + 1 year if parsing fails
    console.log("Using default date (current + 1 year)");
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() + 1);
    return defaultDate;
  };

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState(() => {
    return parseDeadline(deadline);
  });

  // Calculate progress percentage
  const progressPercentage = (currentAmount / targetAmount) * 100;
  // Cap the percentage at 100% for display purposes
  const displayPercentage = Math.min(progressPercentage, 100);

  // Determine if the goal is actually complete based on amounts, not just the flag
  const isActuallyComplete = currentAmount >= targetAmount;

  // Calculate formatted amounts
  const formattedCurrent = currentAmount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formattedTarget = targetAmount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Handle date change with better error handling
  const onDateChange = (event, selectedDate) => {
    console.log("Date selected:", selectedDate); // Debug log

    setShowDatePicker(Platform.OS === "ios");

    if (selectedDate) {
      // Ensure date is valid
      if (!isNaN(selectedDate.getTime())) {
        setDeadlineDate(selectedDate);
        const formattedDate = formatDate(selectedDate);
        console.log("Formatted date:", formattedDate); // Debug log
        setEditedDeadline(formattedDate);
      } else {
        console.error("Invalid date selected");
      }
    }
  };

  // Show date picker based on platform
  const showDatePickerHandler = () => {
    console.log("Opening date picker");
    setShowDatePicker(true);
  };

  // Show modal to enter custom amount
  const showAddFundsModal = () => {
    setAddFundsModalVisible(true);
  };

  // Show modal to manage goal
  const showManageModal = () => {
    // Reset edit values to current values
    setEditedTitle(title);
    setEditedTargetAmount(targetAmount.toString());
    setEditedDeadline(deadline);

    // Also reset the deadline date object
    setDeadlineDate(parseDeadline(deadline));

    setEditMode(false);
    setManageModalVisible(true);
  };

  // Handle adding funds to the goal
  const handleAddFunds = async () => {
    if (!user || !goalId) return;

    // Close the modal first
    setAddFundsModalVisible(false);

    // Validate the amount
    const amount = parseFloat(amountToAdd);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid positive number");
      return;
    }

    try {
      await updateGoal(user.uid, goalId, amount);
      console.log(`Added $${amount} to goal ${goalId}`);
      // Reset the amount to default after successful addition
      setAmountToAdd("100");
    } catch (error) {
      console.error("Error adding funds to goal:", error);
      Alert.alert("Error", "Failed to add funds to goal. Please try again.");
    }
  };

  // Handle deleting a goal
  const handleDeleteGoal = async () => {
    if (!user || !goalId) return;

    // First confirm with the user
    Alert.alert(
      "Delete Goal",
      `Are you sure you want to delete the "${title}" goal?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteGoal(user.uid, goalId);
              setManageModalVisible(false);

              // Notify parent component about deletion
              if (onGoalDeleted) {
                onGoalDeleted(goalId);
              }

              Alert.alert("Success", "Goal deleted successfully");
            } catch (error) {
              console.error("Error deleting goal:", error);
              Alert.alert(
                "Error",
                "Failed to delete the goal. Please try again."
              );
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Handle updating goal details
  const handleUpdateGoal = async () => {
    if (!user || !goalId) return;

    // Validate inputs
    const newTargetAmount = parseFloat(editedTargetAmount);
    if (isNaN(newTargetAmount) || newTargetAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid target amount");
      return;
    }

    if (!editedTitle.trim()) {
      Alert.alert("Invalid Title", "Goal title cannot be empty");
      return;
    }

    try {
      // Create updated goal data
      const updatedGoalData = {
        goalName: editedTitle,
        targetAmount: newTargetAmount,
        deadline: editedDeadline,
        deadlineTimestamp: deadlineDate.getTime(), // Add timestamp for better handling
      };

      // Update in Firebase
      await updateGoalDetails(user.uid, goalId, updatedGoalData);

      // Update display deadline to match edited deadline
      setDisplayDeadline(editedDeadline);

      // Notify parent component about the update if callback exists
      if (onGoalUpdated) {
        onGoalUpdated(goalId, {
          goalName: editedTitle,
          targetAmount: newTargetAmount,
          deadline: editedDeadline,
          // Include other important fields
          currentAmount,
          isCompleted,
        });
      }

      setEditMode(false);
      setManageModalVisible(false);
      Alert.alert("Success", "Goal updated successfully");
    } catch (error) {
      console.error("Error updating goal details:", error);
      Alert.alert("Error", "Failed to update goal details. Please try again.");
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={showManageModal}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.deadline}>Goal by {displayDeadline}</Text>
        </View>
        <Feather name="chevron-right" size={24} color="#CCCCCC" />
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.currentAmount}>{formattedCurrent}</Text>
        <Text style={styles.targetAmount}>of {formattedTarget}</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[styles.progressBar, { width: `${displayPercentage}%` }]}
          />
        </View>
        <Text style={styles.progressPercentage}>
          {Math.round(progressPercentage)}%
        </Text>
      </View>

      <View style={styles.actionContainer}>
        {isActuallyComplete ? (
          <View style={styles.completedContainer}>
            <Feather name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.completedText}>Goal Completed!</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addFundsButton}
            onPress={(e) => {
              e.stopPropagation(); // Prevent triggering the card's onPress
              showAddFundsModal();
            }}
          >
            <Feather name="plus" size={16} color="white" />
            <Text style={styles.addFundsText}>Add Funds</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal for entering custom amount */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={addFundsModalVisible}
        onRequestClose={() => setAddFundsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.centeredView}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add Funds to {title}</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.input}
                value={amountToAdd}
                onChangeText={setAmountToAdd}
                keyboardType="numeric"
                placeholder="Enter amount"
                autoFocus
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setAmountToAdd("100");
                  setAddFundsModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleAddFunds}
              >
                <Text style={styles.confirmButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal for managing goals */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={manageModalVisible}
        onRequestClose={() => setManageModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.centeredView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
          <View style={styles.manageModalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.manageModalTitle}>
                {editMode ? "Edit Goal" : "Manage Goal"}
              </Text>
              <TouchableOpacity
                onPress={() => setManageModalVisible(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {editMode ? (
              // Edit mode UI
              <View style={styles.editContainer}>
                <ScrollView
                  style={styles.editScrollView}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  contentContainerStyle={styles.editScrollViewContent}
                >
                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>Goal Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editedTitle}
                      onChangeText={setEditedTitle}
                      placeholder="Enter goal name"
                    />
                  </View>

                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>Target Amount</Text>
                    <View style={styles.inputContainer}>
                      <Text style={styles.dollarSign}>$</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editedTargetAmount}
                        onChangeText={setEditedTargetAmount}
                        keyboardType="numeric"
                        placeholder="Enter target amount"
                      />
                    </View>
                  </View>

                  <View style={styles.formField}>
                    <Text style={styles.formLabel}>Deadline</Text>
                    <Pressable
                      onPress={showDatePickerHandler}
                      style={styles.datePickerButton}
                    >
                      <Text style={styles.dateText}>{editedDeadline}</Text>
                      <Feather name="calendar" size={20} color="#555" />
                    </Pressable>

                    {/* Show currently selected date in a more visible format */}
                    {showDatePicker && (
                      <View style={styles.selectedDateContainer}>
                        <Text style={styles.selectedDateLabel}>
                          Selected date:
                        </Text>
                        <Text style={styles.selectedDateValue}>
                          {formatDate(deadlineDate)}
                        </Text>
                      </View>
                    )}

                    {showDatePicker && (
                      <>
                        {Platform.OS === "ios" ? (
                          <View style={styles.iosPickerContainer}>
                            <View style={styles.iosPickerHeader}>
                              <TouchableOpacity
                                onPress={() => setShowDatePicker(false)}
                              >
                                <Text style={styles.iosPickerDoneText}>
                                  Done
                                </Text>
                              </TouchableOpacity>
                            </View>
                            <DateTimePicker
                              testID="dateTimePicker"
                              value={deadlineDate}
                              mode="date"
                              display="spinner"
                              onChange={onDateChange}
                              minimumDate={new Date()}
                              style={styles.iosDatePicker}
                              textColor="#000000"
                              themeVariant="light"
                            />
                          </View>
                        ) : (
                          <DateTimePicker
                            testID="dateTimePicker"
                            value={deadlineDate}
                            mode="date"
                            is24Hour={true}
                            display="default"
                            onChange={onDateChange}
                            minimumDate={new Date()}
                            themeVariant="light"
                            textColor="#000000"
                          />
                        )}
                      </>
                    )}
                  </View>

                  <View style={styles.editButtonContainer}>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => setEditMode(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.button, styles.confirmButton]}
                      onPress={handleUpdateGoal}
                    >
                      <Text style={styles.confirmButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            ) : (
              // View mode UI
              <View>
                <View style={styles.goalDetailItem}>
                  <Text style={styles.goalDetailLabel}>Goal Name:</Text>
                  <Text style={styles.goalDetailValue}>{title}</Text>
                </View>

                <View style={styles.goalDetailItem}>
                  <Text style={styles.goalDetailLabel}>Progress:</Text>
                  <Text style={styles.goalDetailValue}>
                    {Math.round(progressPercentage)}% complete
                  </Text>
                </View>

                <View style={styles.goalDetailItem}>
                  <Text style={styles.goalDetailLabel}>Current Amount:</Text>
                  <Text style={styles.goalDetailValue}>{formattedCurrent}</Text>
                </View>

                <View style={styles.goalDetailItem}>
                  <Text style={styles.goalDetailLabel}>Target Amount:</Text>
                  <Text style={styles.goalDetailValue}>{formattedTarget}</Text>
                </View>

                <View style={styles.goalDetailItem}>
                  <Text style={styles.goalDetailLabel}>Deadline:</Text>
                  <Text style={styles.goalDetailValue}>{displayDeadline}</Text>
                </View>

                <View style={styles.goalDetailItem}>
                  <Text style={styles.goalDetailLabel}>Status:</Text>
                  <Text
                    style={[
                      styles.goalDetailValue,
                      isActuallyComplete
                        ? styles.completedText
                        : styles.inProgressText,
                    ]}
                  >
                    {isActuallyComplete ? "Completed" : "In Progress"}
                  </Text>
                </View>

                <View style={styles.managementOptions}>
                  {!isActuallyComplete && (
                    <TouchableOpacity
                      style={styles.managementButton}
                      onPress={() => {
                        setManageModalVisible(false);
                        setTimeout(() => {
                          showAddFundsModal();
                        }, 300);
                      }}
                    >
                      <Feather name="dollar-sign" size={20} color="white" />
                      <Text style={styles.managementButtonText}>Add Funds</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.managementButton, styles.editButton]}
                    onPress={() => setEditMode(true)}
                  >
                    <Feather name="edit-2" size={20} color="white" />
                    <Text style={styles.managementButtonText}>Edit Goal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.managementButton, styles.deleteButton]}
                    onPress={handleDeleteGoal}
                  >
                    <Feather name="trash-2" size={20} color="white" />
                    <Text style={styles.managementButtonText}>Delete Goal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  deadline: {
    fontSize: 14,
    color: "#888",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  currentAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4C38CD",
    marginRight: 5,
  },
  targetAmount: {
    fontSize: 16,
    color: "#888",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    marginRight: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4C38CD",
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4C38CD",
    width: 40,
    textAlign: "right",
  },
  actionContainer: {
    alignItems: "flex-start",
  },
  addFundsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4C38CD",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addFundsText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 5,
  },
  completedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  completedText: {
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 5,
  },
  inProgressText: {
    color: "#4C38CD",
    fontWeight: "600",
  },
  // Modal styles
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "#4C38CD",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  dollarSign: {
    fontSize: 22,
    fontWeight: "bold",
    marginRight: 5,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    width: "48%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  confirmButton: {
    backgroundColor: "#4C38CD",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "600",
  },
  // Manage modal styles
  manageModalView: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginTop: 40,
    marginBottom: 60,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 15,
  },
  manageModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4C38CD",
  },
  closeButton: {
    padding: 5,
  },
  goalDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  goalDetailLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  goalDetailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  managementOptions: {
    marginTop: 20,
    gap: 10,
  },
  managementButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4C38CD",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 5,
  },
  managementButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 10,
    fontSize: 16,
  },
  editButton: {
    backgroundColor: "#FF9800",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  // Edit mode styles
  editContainer: {
    width: "100%",
  },
  editScrollView: {
    width: "100%",
    maxHeight: 400,
  },
  editScrollViewContent: {
    paddingBottom: 20,
  },
  formField: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
  },
  editButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingHorizontal: 5,
    paddingBottom: 10,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FAFAFA",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  iosPickerContainer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },
  iosPickerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  iosPickerDoneText: {
    color: "#4C38CD",
    fontSize: 16,
    fontWeight: "600",
  },
  iosDatePicker: {
    height: 200,
    width: "100%",
  },
  selectedDateContainer: {
    backgroundColor: "#F5F5FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedDateLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  selectedDateValue: {
    fontSize: 16,
    color: "#4C38CD",
    fontWeight: "600",
  },
});

export default SavingsGoalCard;
