import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, StatusBar, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Typography } from "../../src/components/ui/Typography";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { s, vs } from "../../src/constants/responsive";

interface BusinessDetailsData {
  accountName: string;
  accountNumber: string;
  documentUpload: string | null;
}

export default function BusinessDetailsScreen() {
  const params = useLocalSearchParams();
  
  const [businessData, setBusinessData] = useState<BusinessDetailsData>({
    accountName: "",
    accountNumber: "",
    documentUpload: null,
  });

  const [errors, setErrors] = useState({
    accountName: "",
    accountNumber: "",
    documentUpload: "",
  });

  const validateForm = () => {
    const newErrors = {
      accountName: "",
      accountNumber: "",
      documentUpload: "",
    };

    // Account Name validation
    if (!businessData.accountName.trim()) {
      newErrors.accountName = "Account name is required";
    }

    // Account Number validation
    if (!businessData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (businessData.accountNumber.length < 10) {
      newErrors.accountNumber = "Account number must be at least 10 digits";
    }

    // Document upload validation
    if (!businessData.documentUpload) {
      newErrors.documentUpload = "Business permit document is required";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  const handleDocumentUpload = () => {
    // TODO: Implement document upload functionality
    Alert.alert(
      "Upload Document",
      "Document upload functionality will be implemented here",
      [
        {
          text: "OK",
          onPress: () => {
            // Simulate document upload
            setBusinessData({ ...businessData, documentUpload: "business-permit.pdf" });
          }
        }
      ]
    );
  };

  const handleContinue = () => {
    if (validateForm()) {
      // TODO: Implement business details submission to backend
      // Navigate to registration completion screen
      router.push("/(auth)/register-complete");
    } else {
      const errorMessage = Object.values(errors).filter(error => error).join("\n");
      Alert.alert("Validation Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#652A70" />
      
      {/* Custom Status Bar - Figma: x:0, y:0, width:439.5, height:54 */}
      <View style={styles.statusBarContainer}>
        <View style={styles.statusBarContent}>
          <View style={styles.timeContainer}>
            <Typography variant="body" style={styles.timeText}>9:41</Typography>
          </View>
          <View style={styles.levelsContainer}>
            {/* Battery, WiFi, Cellular icons placeholder */}
            <View style={styles.iconPlaceholder} />
          </View>
        </View>
      </View>
      
      {/* Header Section - Figma: "Get Started" at x:22, y:84; subtitle at x:20, y:106 */}
      <View style={styles.headerSection}>
        <Typography variant="h2" style={styles.getStartedText}>
          Get Started
        </Typography>
        <Typography variant="body" style={styles.subtitleText}>
          Register to create an account
        </Typography>
        
        {/* TindaGo Logo - Figma: x:329, y:45, width:100, height:100 */}
        <View style={styles.logoContainer}>
          <Image 
            source={require("../../src/assets/images/business-details/logo-image.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Content Card - Figma: x:0, y:150, width:440, height:806, borderRadius:20px */}
      <View style={styles.contentCard}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Register Title - Figma: x:183, y:204, textAlign:center */}
          <Typography variant="h2" style={styles.registerTitle}>
            Register
          </Typography>

          {/* Progress Line - Figma: x:20, y:252, width:400 */}
          <View style={styles.progressSection}>
            <View style={styles.progressLine}>
              <View style={[styles.progressSegment, styles.activeSegment]} />
              <View style={[styles.progressSegment, styles.activeSegment]} />
              <View style={[styles.progressSegment, styles.activeSegment]} />
              <View style={[styles.progressSegment, styles.activeSegment]} />
            </View>
          </View>

          {/* Section Label - Figma: "Business Permit" at x:20, y:272 */}
          <Typography variant="h2" style={styles.sectionLabel}>
            Business Permit
          </Typography>

          {/* Form Fields Section - Starting around y:314 */}
          <View style={styles.formSection}>
            {/* Account Name Field - Figma: x:20, y:314 */}
            <View style={styles.fieldContainer}>
              <Typography variant="body" style={styles.fieldLabel}>
                Account Name
              </Typography>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter account name"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={businessData.accountName}
                  onChangeText={(text) => setBusinessData({ ...businessData, accountName: text })}
                />
              </View>
              {errors.accountName ? (
                <Typography variant="caption" style={styles.errorText}>
                  {errors.accountName}
                </Typography>
              ) : null}
            </View>

            {/* Account Number Field - Figma: x:22, y:411 */}
            <View style={styles.fieldContainer}>
              <Typography variant="body" style={styles.fieldLabel}>
                Account Number
              </Typography>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter account number"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={businessData.accountNumber}
                  onChangeText={(text) => setBusinessData({ ...businessData, accountNumber: text })}
                  keyboardType="numeric"
                />
              </View>
              {errors.accountNumber ? (
                <Typography variant="caption" style={styles.errorText}>
                  {errors.accountNumber}
                </Typography>
              ) : null}
            </View>
          </View>

          {/* Upload Document Section - Figma: x:22, y:508, width:398, height:177 */}
          <View style={styles.uploadSection}>
            <Typography variant="body" style={styles.uploadLabel}>
              Upload Document
            </Typography>
            
            <TouchableOpacity style={styles.uploadContainer} onPress={handleDocumentUpload}>
              <View style={styles.uploadBox}>
                <Image 
                  source={require("../../src/assets/images/business-details/upload-icon.png")}
                  style={styles.uploadIcon}
                  resizeMode="contain"
                />
                <Typography variant="caption" style={styles.uploadText}>
                  {businessData.documentUpload ? businessData.documentUpload : "Upload your photo"}
                </Typography>
              </View>
            </TouchableOpacity>
            {errors.documentUpload ? (
              <Typography variant="caption" style={styles.errorText}>
                {errors.documentUpload}
              </Typography>
            ) : null}
          </View>

          {/* Continue Button - Figma: x:20, y:839, width:400, height:50 */}
          <View style={styles.buttonSection}>
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Typography variant="h2" style={styles.continueButtonText}>
                Continue
              </Typography>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#652A70', // Figma: fill_QV0CRJ
  },
  
  // Status Bar Container - Figma: x:0, y:0, width:439.5, height:54
  statusBarContainer: {
    backgroundColor: 'transparent',
    paddingTop: vs(10),
    paddingHorizontal: s(20),
  },
  statusBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: vs(54),
  },
  timeContainer: {
    // Figma: x:51.92, y:18.34, width:36, height:22
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    // Figma: fontSize:17, fontWeight:400, fontFamily:ABeeZee
    fontSize: s(17),
    fontWeight: '400',
    color: Colors.white,
    fontFamily: Fonts.secondary, // ABeeZee
  },
  levelsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: s(60),
    height: vs(20),
    // Battery, wifi, cellular icons would go here
  },
  
  // Header Section - Figma: "Get Started" at x:22, y:84
  headerSection: {
    paddingTop: vs(20),
    paddingHorizontal: s(20),
    paddingBottom: vs(15),
    position: 'relative',
  },
  getStartedText: {
    // Figma: x:22, y:84, fontSize:24, fontWeight:600, color:#FFFFFF
    fontSize: s(24),
    fontWeight: '600',
    color: Colors.white,
    marginLeft: s(2),
    marginBottom: vs(6),
  },
  subtitleText: {
    // Figma: x:20, y:106, fontSize:14, fontWeight:400, color:rgba(255, 255, 255, 0.5)
    fontSize: s(14),
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: vs(20),
  },
  logoContainer: {
    // Figma: x:329, y:45, width:100, height:100
    position: 'absolute',
    right: s(11), // 440 - 329 - 100 = 11
    top: vs(10),
    width: s(100),
    height: vs(100),
  },
  logo: {
    width: s(100),
    height: vs(100),
  },

  // Content Card - Figma: x:0, y:150, width:440, height:806, borderRadius:20px
  contentCard: {
    flex: 1,
    backgroundColor: '#F4F6F6', // Figma: fill_KTAD6X
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    marginTop: vs(25),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: vs(40),
  },

  // Register Title - Figma: x:183, y:204, fontSize:20, fontWeight:500, textAlign:center
  registerTitle: {
    fontSize: s(20),
    fontWeight: '500',
    color: Colors.black,
    textAlign: 'center',
    marginTop: vs(40), // Position from top of card
    marginBottom: vs(5),
  },

  // Progress Section - Figma: x:20, y:252, width:400
  progressSection: {
    marginTop: vs(20),
    marginHorizontal: s(20),
    marginBottom: vs(15),
  },
  progressLine: {
    flexDirection: 'row',
    gap: s(16), // Space between segments
  },
  progressSegment: {
    width: s(88), // Figma width for each vector
    height: vs(4), // Stroke weight
  },
  activeSegment: {
    backgroundColor: '#02545F', // Figma: stroke_N53ZJ9 (all segments active for business details)
  },
  inactiveSegment: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)', // For future use
  },

  // Section Label - Figma: "Business Permit" at x:20, y:272
  sectionLabel: {
    fontSize: s(20),
    fontWeight: '500',
    color: '#1E1E1E', // Figma: fill_A90WKS
    marginHorizontal: s(20),
    marginTop: vs(8),
    marginBottom: vs(25),
  },

  // Form Section - Fields start around y:314
  formSection: {
    paddingHorizontal: s(20),
    gap: vs(25), // Spacing between form fields
  },
  fieldContainer: {
    // Figma: column layout with 5px gap
    gap: vs(5),
  },
  fieldLabel: {
    // Figma: fontSize:16, fontWeight:500, color:#1E1E1E
    fontSize: s(16),
    fontWeight: '500',
    color: '#1E1E1E', // Figma: fill_A90WKS
  },
  inputContainer: {
    // Figma: borderRadius:20px, border:#02545F 2px, padding:14px 20px, shadow
    borderRadius: s(20),
    borderWidth: 2,
    borderColor: '#02545F', // Figma: stroke_A11Q1L
    paddingVertical: vs(14),
    paddingHorizontal: s(20),
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 5,
    minHeight: vs(50),
  },
  textInput: {
    // Figma: fontSize:14, fontWeight:500, color:rgba(30, 30, 30, 0.5)
    fontSize: s(14),
    fontWeight: '500',
    color: '#1E1E1E',
    fontFamily: Fonts.primary, // Clash Grotesk Variable
    flex: 1,
  },
  errorText: {
    fontSize: s(12),
    color: Colors.red,
    marginTop: vs(5),
  },

  // Upload Section - Figma: x:22, y:508, width:398, height:177
  uploadSection: {
    marginTop: vs(25),
    paddingHorizontal: s(20),
    gap: vs(8),
  },
  uploadLabel: {
    // Figma: fontSize:16, fontWeight:500, color:#000000
    fontSize: s(16),
    fontWeight: '500',
    color: Colors.black, // Figma: fill_WJQ71M
    marginLeft: s(2),
  },
  uploadContainer: {
    // Figma: x:0, y:27, width:398, height:150
    marginTop: vs(5),
  },
  uploadBox: {
    // Figma: borderRadius:20px, backgroundColor:#FFFFFF, shadow, width:398, height:150
    backgroundColor: Colors.white, // Figma: fill_37BQ6P
    borderRadius: s(20),
    height: vs(150),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 3,
    gap: vs(8),
  },
  uploadIcon: {
    // Figma: x:35, y:0, width:25, height:25 (relative to upload text)
    width: s(25),
    height: vs(25),
  },
  uploadText: {
    // Figma: fontSize:12, fontWeight:400, color:rgba(30, 30, 30, 0.5), textAlign:center
    fontSize: s(12),
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.5)', // Figma: fill_6N13H7
    textAlign: 'center',
  },

  // Button Section - Figma: x:20, y:839, width:400, height:50
  buttonSection: {
    marginTop: vs(35),
    paddingHorizontal: s(20),
    marginBottom: vs(30),
  },
  continueButton: {
    // Figma: backgroundColor:#3BB77E, borderRadius:20px, padding:10px, shadow
    backgroundColor: Colors.primary, // Figma: fill_2JO4V2
    borderRadius: s(20),
    paddingVertical: vs(10),
    alignItems: 'center',
    justifyContent: 'center',
    height: vs(50),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(4),
    elevation: 3,
  },
  continueButtonText: {
    // Figma: fontSize:20, fontWeight:500, color:#FFFFFF, textAlign:center
    fontSize: s(20),
    fontWeight: '500',
    color: Colors.white,
  },
});