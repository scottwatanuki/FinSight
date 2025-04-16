import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

interface GoalModalProps {
  animationType: "none" | "slide" | "fade";
  transparent: boolean;
  visible: boolean;
  onRequestClose: () => void;
}

const GoalModal: React.FC<GoalModalProps> = ({
  animationType,
  transparent,
  visible,
  onRequestClose,
}) => {
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

  const handleAddGoal = () => {
    // Add goal implementation here
    onRequestClose();
    setGoalName("");
    setGoalAmount("");
  };

  return (
    <Modal
      animationType={animationType}
      transparent={transparent}
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={styles.container}>
              <Text style={styles.modalTitle}>Create New Savings Goal</Text>
              <Text style={styles.inputLabel}>Goal Name</Text>
              <TextInput
                style={styles.input}
                value={goalName}
                onChangeText={(text) => setGoalName(text)}
                placeholder="e.g., Emergency Fund, New Car"
              />

              <Text style={styles.inputLabel}>Target Amount ($)</Text>
              <TextInput
                style={styles.input}
                value={goalAmount}
                onChangeText={(text) => setGoalAmount(text)}
                placeholder="e.g., 5000"
                keyboardType="numeric"
              />

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    onRequestClose();
                    setGoalName("");
                    setGoalAmount("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.addButton]}
                  onPress={handleAddGoal}
                >
                  <Text style={styles.addButtonText}>Create Goal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  container: {
    width: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f2f2f2",
  },
  addButton: {
    backgroundColor: "#4C38CD",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "500",
  },
  addButtonText: {
    color: "white",
    fontWeight: "500",
  },
});

export default GoalModal;
