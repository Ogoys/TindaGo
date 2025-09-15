import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { Image } from "expo-image";
import * as DocumentPicker from "expo-document-picker";
import { ref, update } from "firebase/database";
import { database } from "../../../FirebaseConfig";
import { Button } from "../../../src/components/ui/Button";
import { FormInput } from "../../../src/components/ui/FormInput";
import { Colors } from "../../../src/constants/Colors";
import { responsive, s, vs } from "../../../src/constants/responsive";

interface DocumentUploadData {
  accountName: string;
  accountNumber: string;
  businessPermit: any;
}

interface DocumentUploadErrors {
  accountName: string;
  accountNumber: string;
  businessPermit: string;
}

export default function DocumentUploadScreen() {
  const [formData, setFormData] = useState<DocumentUploadData>({
    accountName: "",
    accountNumber: "",
    businessPermit: null,
  });

  const [errors, setErrors] = useState<DocumentUploadErrors>({
    accountName: "",
    accountNumber: "",
    businessPermit: "",
  });

  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: DocumentUploadErrors = {
      accountName: "",
      accountNumber: "",
      businessPermit: "",
    };

    // Account Name validation
    if (!formData.accountName.trim()) {
      newErrors.accountName = "Account name is required";
    } else if (formData.accountName.trim().length < 2) {
      newErrors.accountName = "Account name must be at least 2 characters";
    }

    // Account Number validation
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (formData.accountNumber.trim().length < 5) {
      newErrors.accountNumber = "Account number must be at least 5 characters";
    }

    // Business Permit validation
    if (!formData.businessPermit) {
      newErrors.businessPermit = "Business permit document is required";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  const handleDocumentUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormData({ ...formData, businessPermit: result.assets[0] });
        setErrors({ ...errors, businessPermit: "" });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      const errorMessage = Object.values(errors).filter(error => error).join("\n");
      Alert.alert("Validation Error", errorMessage);
      return;
    }

    setLoading(true);

    try {
      // Here you would typically upload the document to Firebase Storage
      // and update the user's profile with the document information

      // For now, we'll just update the database with completion status
      // In a real implementation, you'd upload the file to Firebase Storage first

      // Navigate to the RegistrationComplete screen
      router.push("/(auth)/(store-owner)/RegistrationComplete");

    } catch (error: any) {
      Alert.alert("Error", "Failed to complete registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#652A70" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.getStartedText}>Get Started</Text>
          <Text style={styles.subtitleText}>Register to create an account</Text>

          {/* Step 4 Icon */}
          <Image
            source={require("../../../src/assets/images/store-registration/step-4-icon.png")}
            style={styles.stepIcon}
            contentFit="contain"
          />
        </View>

        {/* Card Container */}
        <View style={styles.cardContainer}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={[styles.progressSegment, styles.progressActive]} />
          </View>

          {/* Register Title */}
          <Text style={styles.registerTitle}>Register</Text>

          {/* Business Permit Label */}
          <Text style={styles.businessPermitLabel}>Business Permit</Text>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Account Name Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Account Name</Text>
              <FormInput
                placeholder="Enter account name"
                value={formData.accountName}
                onChangeText={(text) => setFormData({ ...formData, accountName: text })}
                style={styles.formInput}
              />
            </View>

            {/* Account Number Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Account Number</Text>
              <FormInput
                placeholder="Enter account number"
                value={formData.accountNumber}
                onChangeText={(text) => setFormData({ ...formData, accountNumber: text })}
                style={styles.formInput}
              />
            </View>

            {/* Document Upload Section */}
            <View style={styles.uploadSection}>
              <Text style={styles.uploadLabel}>Upload Document</Text>
              <TouchableOpacity style={styles.uploadContainer} onPress={handleDocumentUpload}>
                <View style={styles.uploadBox}>
                  <Image
                    source={require("../../../src/assets/images/store-registration/upload-icon.png")}
                    style={styles.uploadIcon}
                    contentFit="contain"
                  />
                  <Text style={styles.uploadText}>
                    {formData.businessPermit ? formData.businessPermit.name : "Upload your photo"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Continue Button */}
          <View style={styles.buttonSection}>
            <Button
              title={loading ? "Submitting..." : "Continue"}
              variant="primary"
              onPress={handleContinue}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#652A70", // Purple background from Figma
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Header Section (Purple background area)
  headerSection: {
    // Figma coordinates for header area
    paddingTop: vs(84 - 54), // Account for status bar
    paddingHorizontal: s(22),
    paddingBottom: vs(45),
  },
  getStartedText: {
    // Figma: x:22, y:84, width:131, height:22
    fontFamily: "Clash Grotesk Variable",
    fontSize: s(24),
    fontWeight: "600",
    color: Colors.white,
    marginBottom: vs(22),
  },
  subtitleText: {
    // Figma: x:20, y:106, width:176, height:22
    fontFamily: "Clash Grotesk Variable",
    fontSize: s(14),
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.5)",
    marginBottom: vs(39),
  },
  stepIcon: {
    // Figma: x:329, y:45, width:100, height:100
    position: "absolute",
    right: s(11), // 440 - 329 - 100 = 11
    top: vs(45 - 54), // Account for status bar
    width: s(100),
    height: vs(100),
  },

  // Card Container (White background)
  cardContainer: {
    // Figma Rectangle 36: x:0, y:150, width:440, height:806
    flex: 1,
    backgroundColor: "#F4F6F6",
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    paddingTop: vs(102), // Space for progress indicator and title
  },

  // Progress Indicator
  progressContainer: {
    // Figma Line group: x:20, y:252, width:400, height:0
    position: "absolute",
    top: vs(102), // 252 - 150 = 102
    left: s(20),
    flexDirection: "row",
    gap: s(16), // Space between segments
  },
  progressSegment: {
    width: s(88), // Exact Figma width
    height: vs(4),
    borderRadius: s(2),
  },
  progressActive: {
    backgroundColor: "#02545F", // Active color from Figma
  },

  // Register Title
  registerTitle: {
    // Figma: x:183, y:204, width:75, height:22
    position: "absolute",
    top: vs(54), // 204 - 150 = 54
    alignSelf: "center",
    fontFamily: "Clash Grotesk Variable",
    fontSize: s(20),
    fontWeight: "500",
    color: Colors.black,
  },

  // Business Permit Label
  businessPermitLabel: {
    // Figma: x:20, y:272, width:145, height:22
    position: "absolute",
    top: vs(122), // 272 - 150 = 122
    left: s(20),
    fontFamily: "Clash Grotesk Variable",
    fontSize: s(20),
    fontWeight: "500",
    color: "#1E1E1E",
  },

  // Form Section
  formSection: {
    paddingHorizontal: s(20),
    marginTop: vs(42), // Space after business permit label
  },

  // Field Containers
  fieldContainer: {
    marginBottom: vs(25),
  },
  fieldLabel: {
    fontFamily: "Clash Grotesk Variable",
    fontSize: s(16),
    fontWeight: "500",
    color: "#1E1E1E",
    marginBottom: vs(5),
  },
  formInput: {
    // Use existing FormInput component styling
  },

  // Upload Section
  uploadSection: {
    // Figma Logo group: x:22, y:508, width:398, height:177
    marginTop: vs(30),
  },
  uploadLabel: {
    // Figma: x:24, y:508, width:128, height:22
    fontFamily: "Clash Grotesk Variable",
    fontSize: s(16),
    fontWeight: "500",
    color: Colors.black,
    marginBottom: vs(15),
  },
  uploadContainer: {
    // Touch target for upload
  },
  uploadBox: {
    // Figma Subtract: x:22, y:535, width:398, height:150
    width: s(398),
    height: vs(150),
    backgroundColor: Colors.white,
    borderRadius: s(20),
    borderWidth: s(2),
    borderColor: "#02545F",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: s(5),
    elevation: 5,
  },
  uploadIcon: {
    // Figma Upload: x:207, y:586, width:25, height:25
    width: s(25),
    height: vs(25),
    marginBottom: vs(10),
  },
  uploadText: {
    // Figma: x:172, y:611, width:95, height:22
    fontFamily: "Clash Grotesk Variable",
    fontSize: s(12),
    fontWeight: "400",
    color: "rgba(30, 30, 30, 0.5)",
    textAlign: "center",
  },

  // Button Section
  buttonSection: {
    // Figma Continue: x:20, y:839, width:400, height:50
    paddingHorizontal: s(20),
    marginTop: vs(60),
    marginBottom: vs(40),
  },
});