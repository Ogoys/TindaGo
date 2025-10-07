import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { Image } from "expo-image";
import * as DocumentPicker from "expo-document-picker";
import { readAsStringAsync } from "expo-file-system/legacy";
import { auth } from "../../../FirebaseConfig";
import { Button } from "../../../src/components/ui/Button";
// import { FormInput } from "../../../src/components/ui/FormInput";
import { Colors } from "../../../src/constants/Colors";
import { s, vs } from "../../../src/constants/responsive";
import { StoreRegistrationService } from '../../../src/services/StoreRegistrationService';

interface DocumentUploadData {
  barangayBusinessClearance: any;
  businessPermit: any;
  dtiRegistration: any;
  validId: any;
}

interface DocumentUploadErrors {
  barangayBusinessClearance: string;
  businessPermit: string;
  dtiRegistration: string;
  validId: string;
}

export default function DocumentUploadScreen() {
  // Get store info from previous screen
  const { storeName, ownerName, ownerEmail } = useLocalSearchParams<{
    storeName?: string;
    ownerName?: string;
    ownerEmail?: string;
  }>();

  const [formData, setFormData] = useState<DocumentUploadData>({
    barangayBusinessClearance: null,
    businessPermit: null,
    dtiRegistration: null,
    validId: null,
  });

  const [errors, setErrors] = useState<DocumentUploadErrors>({
    barangayBusinessClearance: "",
    businessPermit: "",
    dtiRegistration: "",
    validId: "",
  });

  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: DocumentUploadErrors = {
      barangayBusinessClearance: "",
      businessPermit: "",
      dtiRegistration: "",
      validId: "",
    };

    // Essential documents for business verification
    // Only Business Permit and Valid ID are mandatory for now
    if (!formData.businessPermit) {
      newErrors.businessPermit = "Business Permit is required";
    }

    if (!formData.validId) {
      newErrors.validId = "Valid Government ID is required";
    }

    // Optional documents (can be added later)
    // Barangay Business Clearance and DTI Registration are not mandatory for testing

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  const handleDocumentUpload = async (documentType: keyof DocumentUploadData) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const document = result.assets[0];
        const documentUri = document.uri;

        // Convert document to Base64 (same as add-product)
        const base64 = await readAsStringAsync(documentUri, {
          encoding: 'base64',
        });

        // Determine MIME type based on file extension or type
        let mimeType = 'application/pdf'; // Default for PDFs
        if (document.mimeType) {
          mimeType = document.mimeType;
        } else if (document.name && document.name.toLowerCase().includes('.jpg')) {
          mimeType = 'image/jpeg';
        } else if (document.name && document.name.toLowerCase().includes('.png')) {
          mimeType = 'image/png';
        }

        // Create the data URL format
        const documentBase64 = `data:${mimeType};base64,${base64}`;

        // Create document info object with base64 data
        const documentInfo = {
          name: document.name || `${documentType}.pdf`,
          uri: documentBase64, // Store base64 instead of local URI
          mimeType: mimeType, // Changed from 'type' to 'mimeType' to match StoreRegistrationService
          size: document.size || 0,
          uploaded: true,
          uploadedAt: new Date().toISOString()
        };

        setFormData({ ...formData, [documentType]: documentInfo });
        setErrors({ ...errors, [documentType]: "" });

        console.log(`✅ ${documentType} converted to Base64 and saved locally`);
        console.log(`  - Name: ${documentInfo.name}`);
        console.log(`  - Type: ${documentInfo.mimeType}`);
        console.log(`  - Size: ${documentInfo.size} bytes`);
        console.log(`  - Base64 preview: ${documentBase64.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error(`❌ Error picking ${documentType}:`, error);
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      const errorMessage = Object.values(errors).filter(error => error).join("\n");
      Alert.alert("Validation Error", errorMessage);
      return;
    }

    if (!auth.currentUser) {
      Alert.alert("Error", "Authentication required. Please sign in again.");
      router.push("/(auth)/signin");
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Uploading documents to Firebase...');
      console.log('  - Barangay Clearance:', formData.barangayBusinessClearance ? '✅ Uploaded' : '⏭️ Skipped');
      console.log('  - Business Permit:', formData.businessPermit ? '✅ Uploaded' : '❌ Missing');
      console.log('  - DTI Registration:', formData.dtiRegistration ? '✅ Uploaded' : '⏭️ Skipped');
      console.log('  - Valid ID:', formData.validId ? '✅ Uploaded' : '❌ Missing');

      // Use centralized service to update documents with standardized status
      await StoreRegistrationService.updateDocuments({
        barangayBusinessClearance: formData.barangayBusinessClearance,
        businessPermit: formData.businessPermit,
        dtiRegistration: formData.dtiRegistration,
        validId: formData.validId,
      });

      console.log('✅ Documents uploaded successfully to Firebase');
      console.log('  - Status changed to: pending (ready for admin review)');
      console.log('  - Documents saved to: stores/{userId} and store_registrations/{userId}');

      Alert.alert(
        "Registration Complete!",
        "Your store registration has been completed successfully. We'll review your application and notify you once approved.",
        [
          {
            text: "View Status",
            onPress: () => {
              console.log("Registration completed for:", storeName);
              router.push({
                pathname: "/(auth)/(store-owner)/RegistrationComplete",
                params: {
                  storeName: storeName || "",
                  ownerName: ownerName || "",
                  ownerEmail: ownerEmail || ""
                }
              });
            }
          }
        ]
      );

    } catch (error: any) {
      console.error("Error uploading documents:", error);
      let errorMessage = "Failed to upload documents. Please try again.";

      if (error.code === 'database/permission-denied') {
        errorMessage = "Permission denied. Please check your authentication.";
      } else if (error.code === 'database/network-error') {
        errorMessage = "Network error. Please check your connection.";
      }

      Alert.alert("Upload Error", errorMessage);
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
          {/* Progress Indicator - Step 4 of 4 */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={[styles.progressSegment, styles.progressCurrent]} />
          </View>

          {/* Register Title */}
          <Text style={styles.registerTitle}>Register</Text>

          {/* Upload Documents Label */}
          <Text style={styles.businessPermitLabel}>Upload Documents</Text>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Barangay Business Clearance */}
            <View style={styles.uploadSection}>
              <Text style={styles.uploadLabel}>Barangay Business Clearance <Text style={styles.optionalLabel}>(Optional)</Text></Text>
              <TouchableOpacity
                style={styles.uploadContainer}
                onPress={() => handleDocumentUpload('barangayBusinessClearance')}
              >
                <View style={[styles.uploadBox, formData.barangayBusinessClearance && styles.uploadBoxSuccess]}>
                  <Image
                    source={require("../../../src/assets/images/store-registration/upload-icon.png")}
                    style={styles.uploadIcon}
                    contentFit="contain"
                  />
                  <Text style={styles.uploadText}>
                    {formData.barangayBusinessClearance ? formData.barangayBusinessClearance.name : "Upload document"}
                  </Text>
                </View>
              </TouchableOpacity>
              {errors.barangayBusinessClearance ? (
                <Text style={styles.errorText}>{errors.barangayBusinessClearance}</Text>
              ) : null}
            </View>

            {/* Business Permit */}
            <View style={styles.uploadSection}>
              <Text style={styles.uploadLabel}>Business Permit <Text style={styles.requiredLabel}>*</Text></Text>
              <TouchableOpacity
                style={styles.uploadContainer}
                onPress={() => handleDocumentUpload('businessPermit')}
              >
                <View style={[styles.uploadBox, formData.businessPermit && styles.uploadBoxSuccess]}>
                  <Image
                    source={require("../../../src/assets/images/store-registration/upload-icon.png")}
                    style={styles.uploadIcon}
                    contentFit="contain"
                  />
                  <Text style={styles.uploadText}>
                    {formData.businessPermit ? formData.businessPermit.name : "Upload document"}
                  </Text>
                </View>
              </TouchableOpacity>
              {errors.businessPermit ? (
                <Text style={styles.errorText}>{errors.businessPermit}</Text>
              ) : null}
            </View>

            {/* DTI Registration */}
            <View style={styles.uploadSection}>
              <Text style={styles.uploadLabel}>DTI Business Name Registration <Text style={styles.optionalLabel}>(Optional)</Text></Text>
              <TouchableOpacity
                style={styles.uploadContainer}
                onPress={() => handleDocumentUpload('dtiRegistration')}
              >
                <View style={[styles.uploadBox, formData.dtiRegistration && styles.uploadBoxSuccess]}>
                  <Image
                    source={require("../../../src/assets/images/store-registration/upload-icon.png")}
                    style={styles.uploadIcon}
                    contentFit="contain"
                  />
                  <Text style={styles.uploadText}>
                    {formData.dtiRegistration ? formData.dtiRegistration.name : "Upload document"}
                  </Text>
                </View>
              </TouchableOpacity>
              {errors.dtiRegistration ? (
                <Text style={styles.errorText}>{errors.dtiRegistration}</Text>
              ) : null}
            </View>

            {/* Valid ID */}
            <View style={styles.uploadSection}>
              <Text style={styles.uploadLabel}>Valid Government ID <Text style={styles.requiredLabel}>*</Text></Text>
              <TouchableOpacity
                style={styles.uploadContainer}
                onPress={() => handleDocumentUpload('validId')}
              >
                <View style={[styles.uploadBox, formData.validId && styles.uploadBoxSuccess]}>
                  <Image
                    source={require("../../../src/assets/images/store-registration/upload-icon.png")}
                    style={styles.uploadIcon}
                    contentFit="contain"
                  />
                  <Text style={styles.uploadText}>
                    {formData.validId ? formData.validId.name : "Upload document"}
                  </Text>
                </View>
              </TouchableOpacity>
              {errors.validId ? (
                <Text style={styles.errorText}>{errors.validId}</Text>
              ) : null}
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
    backgroundColor: "#02545F", // Completed steps
  },
  progressCurrent: {
    backgroundColor: "#3BB77E", // Current step
  },
  progressInactive: {
    backgroundColor: "rgba(30, 30, 30, 0.5)", // Future steps
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
    marginBottom: vs(25),
  },
  uploadLabel: {
    // Figma: x:24, y:508, width:128, height:22
    fontFamily: "Clash Grotesk Variable",
    fontSize: s(16),
    fontWeight: "500",
    color: Colors.black,
    marginBottom: vs(15),
  },

  requiredLabel: {
    color: '#EF4444', // Red color for required asterisk
    fontWeight: "600",
  },

  optionalLabel: {
    color: '#6B7280', // Gray color for optional text
    fontWeight: "400",
    fontSize: s(14),
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

  // Success state for uploaded documents
  uploadBoxSuccess: {
    borderColor: "#3BB77E",
    backgroundColor: "rgba(59, 183, 126, 0.1)",
  },

  // Error text styles
  errorText: {
    fontFamily: "Clash Grotesk Variable",
    fontSize: s(12),
    fontWeight: "400",
    color: "#E92B45",
    marginTop: vs(5),
    marginLeft: s(5),
  },

  // Button Section
  buttonSection: {
    // Figma Continue: x:20, y:839, width:400, height:50
    paddingHorizontal: s(20),
    marginTop: vs(60),
    marginBottom: vs(40),
  },
});