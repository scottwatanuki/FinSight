const React = require( "react");
const { useState } = require( "react");
const {
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
} = require( "react-native");
const { Feather } = require( "@expo/vector-icons");
const { useAuth } = require( "../app/context/AuthContext");
const {
  updateGoal,
  deleteGoal,
  updateGoalDetails,
} = require("../app/backend/pushData");

const SavingsGoalCard = ({
  title = "New Car",
  currentAmount = 3500,
  targetAmount = 15000,
  deadline = "Dec 2023",
  onPress,
  goalId,
  isCompleted = false,
  onGoalDeleted,
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
      await updateGoalDetails(user.uid, goalId, {
        goalName: editedTitle,
        targetAmount: newTargetAmount,
        deadline: editedDeadline,
      });

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
          <Text style={styles.deadline}>Goal by {deadline}</Text>
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
        >
          <ScrollView style={styles.modalScrollView}>
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
                    <TextInput
                      style={styles.textInput}
                      value={editedDeadline}
                      onChangeText={setEditedDeadline}
                      placeholder="E.g., Dec 2025"
                    />
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
                    <Text style={styles.goalDetailValue}>
                      {formattedCurrent}
                    </Text>
                  </View>

                  <View style={styles.goalDetailItem}>
                    <Text style={styles.goalDetailLabel}>Target Amount:</Text>
                    <Text style={styles.goalDetailValue}>
                      {formattedTarget}
                    </Text>
                  </View>

                  <View style={styles.goalDetailItem}>
                    <Text style={styles.goalDetailLabel}>Deadline:</Text>
                    <Text style={styles.goalDetailValue}>{deadline}</Text>
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
                        <Text style={styles.managementButtonText}>
                          Add Funds
                        </Text>
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
                      <Text style={styles.managementButtonText}>
                        Delete Goal
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
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
  modalScrollView: {
    width: "100%",
    maxHeight: "90%",
  },
  manageModalView: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginVertical: 50,
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
    marginTop: 20,
  },
});

export default SavingsGoalCard;
