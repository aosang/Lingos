import { View, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";


export default function ConversationMode() {
  return (
    <View></View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    backgroundColor: "transparent",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerContent: {
    alignItems: "center",
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  audioButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    padding: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryAccentColor,
    justifyContent: "center",
    alignItems: "center",
  },
  textInputWrapper: {
    flex: 1,
    borderRadius: 22,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    fontSize: 16,
    maxHeight: 100,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: "center",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryAccentColor,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  completeModal: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  completeIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.primaryAccentColor}20`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  completeSubtitle: {
    fontSize: 16,
    color: Colors.subduedTextColor,
    textAlign: "center",
    marginBottom: 32,
  },
  completeButton: {
    backgroundColor: Colors.primaryAccentColor,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: "center",
  },
  completeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});