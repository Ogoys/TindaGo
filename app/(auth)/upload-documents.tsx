import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Image, Platform, ScrollView, StatusBar, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Typography } from "../../src/components/ui/Typography";
import { Colors } from "../../src/constants/Colors";
import { Fonts } from "../../src/constants/Fonts";
import { s, vs } from "../../src/constants/responsive";

interface DocumentData {
  storeName: string;
  description: string;
  storeAddress: string;
  city: string;
  state: string;
  zipCode: string;
  logo?: string;
  coverImage?: string;
}

export default function UploadDocumentsScreen() {
  const params = useLocalSearchParams();
  
  const [documentData, setDocumentData] = useState<DocumentData>({
    storeName: "",
    description: "",
    storeAddress: "",
    city: "",
    state: "",
    zipCode: "",
    logo: undefined,
    coverImage: undefined,
  });

  const [errors, setErrors] = useState({
    storeName: "",
    description: "",
    storeAddress: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const pickImage = async (type: 'logo' | 'coverImage') => {
    // Request permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Camera roll permissions are required to upload images.");
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'logo' ? [1, 1] : [3, 2],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDocumentData(prev => ({
        ...prev,
        [type]: result.assets[0].uri
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      storeName: "",
      description: "",
      storeAddress: "",
      city: "",
      state: "",
      zipCode: "",
    };

    // Store Name validation
    if (!documentData.storeName.trim()) {
      newErrors.storeName = "Store name is required";
    }

    // Description validation
    if (!documentData.description.trim()) {
      newErrors.description = "Description is required";
    }

    // Store Address validation
    if (!documentData.storeAddress.trim()) {
      newErrors.storeAddress = "Store address is required";
    }

    // City validation
    if (!documentData.city.trim()) {
      newErrors.city = "City is required";
    }

    // State validation
    if (!documentData.state.trim()) {
      newErrors.state = "State is required";
    }

    // Zip Code validation
    if (!documentData.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  const handleContinue = () => {
    if (validateForm()) {
      // Navigate to bank details screen with current params
      router.push({
        pathname: "/(auth)/bank-details",
        params: params // Pass along existing registration data
      });
    } else {
      const errorMessage = Object.values(errors).filter(error => error).join("\n");
      Alert.alert("Validation Error", errorMessage);
    }
  };

  // Note: Back button functionality can be added to header if needed
  // const handleBackPress = () => {
  //   router.back();
  // };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#652A70" />
      
      {/* Custom Status Bar */}
      <View style={styles.statusBarContainer}>
        <View style={styles.statusBarContent}>
          <View style={styles.timeContainer}>
            <Typography variant="body" style={styles.timeText}>9:41</Typography>
          </View>
          <View style={styles.levelsContainer}>
            {/* Icons placeholder - battery, wifi, cellular */}
            <View style={styles.iconPlaceholder} />
          </View>
        </View>
      </View>
      
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Typography variant="h2" style={styles.getStartedText}>
          Get Started
        </Typography>
        <Typography variant="body" style={styles.subtitleText}>
          Register to create an account
        </Typography>
        
        {/* Store Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require("../../src/assets/images/upload-documents/logo-placeholder.png")}
            style={styles.storeLogo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Content Card */}
      <View style={styles.contentCard}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Register Title - Figma: x:183, y:204 (positioned before progress line) */}
          <Typography variant="h2" style={styles.registerTitle}>
            Register
          </Typography>

          {/* Progress Line - Figma: x:20, y:252 */}
          <View style={styles.progressSection}>
            <View style={styles.progressLine}>
              <View style={[styles.progressSegment, styles.activeSegment]} />
              <View style={[styles.progressSegment, styles.activeSegment]} />
              <View style={[styles.progressSegment, styles.activeSegment]} />
              <View style={[styles.progressSegment, styles.inactiveSegment]} />
            </View>
          </View>

          {/* Section Label */}
          <Typography variant="h2" style={styles.sectionLabel}>
            Upload your documents
          </Typography>

          {/* Document Upload Section - Figma: Logo at x:30, y:314; Cover at x:260, y:314 */}
          <View style={styles.documentSection}>
            {/* Logo Upload */}
            <TouchableOpacity 
              style={styles.uploadContainer} 
              onPress={() => pickImage('logo')}
            >
              <Typography variant="body" style={styles.uploadLabel}>
                Logo
              </Typography>
              <View style={styles.uploadBox}>
                {documentData.logo ? (
                  <Image source={{ uri: documentData.logo }} style={styles.uploadedImage} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Image 
                      source={require("../../src/assets/images/upload-documents/upload-icon.png")}
                      style={styles.uploadIcon}
                    />
                    <Typography variant="caption" style={styles.uploadText}>
                      Upload your photo
                    </Typography>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Cover Image Upload */}
            <TouchableOpacity 
              style={styles.uploadContainer} 
              onPress={() => pickImage('coverImage')}
            >
              <Typography variant="body" style={styles.uploadLabel}>
                Cover Image
              </Typography>
              <View style={styles.uploadBox}>
                {documentData.coverImage ? (
                  <Image source={{ uri: documentData.coverImage }} style={styles.uploadedImage} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Image 
                      source={require("../../src/assets/images/upload-documents/upload-icon-2.png")}
                      style={styles.uploadIcon}
                    />
                    <Typography variant="caption" style={styles.uploadText}>
                      Upload your photo
                    </Typography>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Form Fields Section */}
          <View style={styles.formSection}>
            {/* Store Name Field - Figma: x:22, y:511 */}
            <View style={styles.fieldContainer}>
              <Typography variant="body" style={styles.fieldLabel}>
                Store Name
              </Typography>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter restaurant name"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={documentData.storeName}
                  onChangeText={(text) => setDocumentData({ ...documentData, storeName: text })}
                  autoCapitalize="words"
                  autoCorrect={true}
                  selectionColor="#02545F"
                />
              </View>
            </View>

            {/* Description Field - Figma: x:20, y:608 */}
            <View style={styles.fieldContainer}>
              <Typography variant="body" style={styles.fieldLabel}>
                Description
              </Typography>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter description"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={documentData.description}
                  onChangeText={(text) => setDocumentData({ ...documentData, description: text })}
                  multiline
                  autoCapitalize="sentences"
                  autoCorrect={true}
                  selectionColor="#02545F"
                />
              </View>
            </View>

            {/* Store Address Field - Figma: x:21, y:735 */}
            <View style={styles.fieldContainer}>
              <Typography variant="body" style={styles.fieldLabel}>
                Store Address
              </Typography>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter restaurant address"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={documentData.storeAddress}
                  onChangeText={(text) => setDocumentData({ ...documentData, storeAddress: text })}
                  autoCapitalize="words"
                  autoCorrect={true}
                  selectionColor="#02545F"
                />
              </View>
            </View>

            {/* City and State Row - Figma: City at x:21, y:835; State at x:240, y:835 */}
            <View style={styles.rowContainer}>
              {/* City Field */}
              <View style={styles.halfFieldContainer}>
                <Typography variant="body" style={styles.fieldLabel}>
                  City
                </Typography>
                <View style={styles.halfInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter city"
                    placeholderTextColor="rgba(30, 30, 30, 0.5)"
                    value={documentData.city}
                    onChangeText={(text) => {
                      console.log('City input changed:', text);
                      setDocumentData({ ...documentData, city: text });
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                    selectionColor="#02545F"
                    // Additional props to ensure text visibility
                    underlineColorAndroid="transparent"
                    clearButtonMode="while-editing"
                  />
                </View>
              </View>

              {/* State Field */}
              <View style={styles.halfFieldContainer}>
                <Typography variant="body" style={styles.fieldLabel}>
                  State
                </Typography>
                <View style={styles.halfInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter state"
                    placeholderTextColor="rgba(30, 30, 30, 0.5)"
                    value={documentData.state}
                    onChangeText={(text) => {
                      console.log('State input changed:', text);
                      setDocumentData({ ...documentData, state: text });
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                    selectionColor="#02545F"
                    underlineColorAndroid="transparent"
                    clearButtonMode="while-editing"
                  />
                </View>
              </View>
            </View>

            {/* Zip Code Field - Figma: x:241, y:932 */}
            <View style={styles.zipCodeContainer}>
              <Typography variant="body" style={styles.fieldLabel}>
                Zip Code
              </Typography>
              <View style={styles.halfInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter zip code"
                  placeholderTextColor="rgba(30, 30, 30, 0.5)"
                  value={documentData.zipCode}
                  onChangeText={(text) => {
                    console.log('Zip code input changed:', text);
                    setDocumentData({ ...documentData, zipCode: text });
                  }}
                  keyboardType="numeric"
                  autoCorrect={false}
                  selectionColor="#02545F"
                  underlineColorAndroid="transparent"
                  clearButtonMode="while-editing"
                />
              </View>
            </View>
          </View>

          {/* Continue Button */}
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
    backgroundColor: '#652A70', // Figma: fill_LXJTOH
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
    // Figma: fontSize:17, fontWeight:400, color:#000000 (but we need white for dark bg)
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
    // This would contain battery, wifi, cellular icons
  },
  
  // Header Section - Figma coordinates: x:22, y:84, x:20, y:106, x:329, y:45
  headerSection: {
    paddingTop: vs(20), // Reduced since we already have status bar spacing
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
    top: vs(10), // Adjusted for the reduced header padding
    width: s(100),
    height: vs(100),
  },
  storeLogo: {
    width: s(100),
    height: vs(100),
  },

  // Content Card - Figma: x:0, y:150, width:440, height:806, borderRadius:20px
  contentCard: {
    flex: 1,
    backgroundColor: '#F4F6F6', // Figma: fill_XYPVS1
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    marginTop: vs(25), // Adjust to fit with header
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: vs(40),
  },

  // Progress Section - Figma: x:20, y:252, width:400, height:0
  progressSection: {
    marginTop: vs(20), // Reduced spacing after Register title
    marginHorizontal: s(20),
    marginBottom: vs(15), // Reduced bottom margin for better spacing
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
    backgroundColor: '#02545F', // Figma: stroke_51Z23V
  },
  inactiveSegment: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)', // Figma: stroke_14TM73
  },

  // Register Title - Figma: x:183, y:204, fontSize:20, fontWeight:500, textAlign:center
  registerTitle: {
    fontSize: s(20),
    fontWeight: '500',
    color: Colors.black,
    textAlign: 'center',
    marginTop: vs(40), // Position from top of card to match Figma y:204 position (54px from top of card)
    marginBottom: vs(5), // Small gap before progress line
  },

  // Section Label - Figma: x:20, y:272, fontSize:20, fontWeight:500
  sectionLabel: {
    fontSize: s(20),
    fontWeight: '500',
    color: '#1E1E1E', // Figma: fill_BEFFJW
    marginHorizontal: s(20),
    marginTop: vs(8), // Small gap after progress section (y:272 - y:252 = 20px spacing)
    marginBottom: vs(25), // Spacing before upload section
  },

  // Document Upload Section - Figma: Logo at x:30, y:314; Cover at x:260, y:314
  documentSection: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Space items to match Figma positioning
    paddingLeft: s(30), // Logo starts at x:30
    paddingRight: s(30), // Cover ends at 260+150=410, container is 440, so 30px right padding
    marginBottom: vs(40), // Increase spacing to match Figma layout
  },
  uploadContainer: {
    // Figma: width:150, height:177
    width: s(150),
    height: vs(177),
  },
  uploadLabel: {
    // Figma: fontSize:16, fontWeight:500, color:#000000
    fontSize: s(16),
    fontWeight: '500',
    color: Colors.black,
    marginBottom: vs(5),
  },
  uploadBox: {
    // Figma: width:150, height:150, borderRadius:20px, shadow
    width: s(150),
    height: vs(150),
    borderRadius: s(20),
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  uploadIcon: {
    // Figma: width:25, height:25
    width: s(25),
    height: vs(25),
    marginBottom: vs(10),
  },
  uploadText: {
    // Figma: fontSize:12, fontWeight:400, color:rgba(30, 30, 30, 0.5), textAlign:center
    fontSize: s(12),
    fontWeight: '400',
    color: 'rgba(30, 30, 30, 0.5)',
    textAlign: 'center',
    width: s(95),
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: s(20),
  },

  // Form Section - Form fields start around y:511 in Figma
  formSection: {
    paddingHorizontal: s(20),
    gap: vs(25), // Adjusted spacing to match Figma vertical gaps between fields
  },
  fieldContainer: {
    // Figma: column layout with 5px gap
    gap: vs(5),
  },
  halfFieldContainer: {
    // For half-width fields like city/state
    gap: vs(5),
    flex: 1,
  },
  zipCodeContainer: {
    // For the zip code field that should be positioned like Figma: x:241, y:932
    gap: vs(5),
    alignSelf: 'flex-end', // Align to the right side like the state field
    width: s(180), // Same width as half fields
  },
  rowContainer: {
    flexDirection: 'row',
    gap: s(20), // Space between city and state
  },
  fieldLabel: {
    // Figma: fontSize:16, fontWeight:500, color:#1E1E1E
    fontSize: s(16),
    fontWeight: '500',
    color: '#1E1E1E',
  },
  inputContainer: {
    // Figma: borderRadius:20px, border:#02545F 2px, padding:14px 20px, shadow
    borderRadius: s(20),
    borderWidth: 2,
    borderColor: '#02545F',
    paddingVertical: vs(14),
    paddingHorizontal: s(20),
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 5,
    minHeight: vs(50), // Ensure consistent height
  },
  halfInputContainer: {
    // For half-width inputs - Figma: width:180, height:50
    borderRadius: s(20),
    borderWidth: 2,
    borderColor: '#02545F',
    paddingVertical: vs(14),
    paddingHorizontal: s(20),
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 5,
    height: vs(50),
    width: s(180),
  },
  textInput: {
    // Figma: fontSize:14, fontWeight:500, color:#1E1E1E
    fontSize: s(14),
    fontWeight: '500',
    color: '#1E1E1E', // Dark gray for high contrast while matching design
    // Use system font as fallback in case custom font isn't loaded
    fontFamily: Platform.select({
      ios: Fonts.primary,
      android: Fonts.primary,
      default: 'System',
    }),
    flex: 1,
    // Ensure text is visible and properly styled
    includeFontPadding: false,
    textAlignVertical: 'center',
    // Additional properties to ensure visibility
    opacity: 1,
    backgroundColor: 'transparent',
    // Force text to be visible
    textAlign: 'left',
    // Debug properties to ensure visibility
    minHeight: vs(20),
    // Ensure proper text rendering on all platforms
    ...(Platform.OS === 'android' && {
      textAlignVertical: 'center',
      paddingVertical: 0,
    }),
    ...(Platform.OS === 'ios' && {
      lineHeight: s(20),
    }),
  },

  // Button Section - Figma: x:20, y:1049, width:400, height:50
  buttonSection: {
    marginTop: vs(35), // Adjusted to better match the Figma positioning
    paddingHorizontal: s(20),
    marginBottom: vs(30), // Increased bottom margin for better spacing
  },
  continueButton: {
    // Figma: backgroundColor:#3BB77E, borderRadius:20px, padding:10px, shadow
    backgroundColor: Colors.primary,
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