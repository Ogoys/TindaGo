import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Figma design baseline (TindaGo onboarding frame)
const guidelineBaseWidth = 440;
const guidelineBaseHeight = 956;

// Scaling functions based on baseline
const scale = (size: number): number => width / guidelineBaseWidth * size;
const verticalScale = (size: number): number => height / guidelineBaseHeight * size;
const moderateScale = (size: number, factor: number = 0.5): number => size + (scale(size) - size) * factor;

// Export scaling functions
export { scale as s, verticalScale as vs, moderateScale as ms };

// Common responsive values based on Figma design (440x956)
export const responsive = {
  // Spacing
  spacing: {
    xs: scale(4),
    sm: scale(8),
    md: scale(16),
    lg: scale(20),
    xl: scale(32),
    xxl: scale(40),
  },
  
  // Border radius
  borderRadius: {
    sm: scale(8),
    md: scale(15),
    lg: scale(20),
    xl: scale(25),
  },
  
  // Font sizes (responsive)
  fontSize: {
    xs: moderateScale(14),
    sm: moderateScale(17),
    md: moderateScale(18),
    lg: moderateScale(20),
    xl: moderateScale(28),
  },
  
  // Component dimensions
  button: {
    height: verticalScale(50),
    borderRadius: scale(20),
  },
  
  // Screen dimensions
  screen: {
    width: width,
    height: height,
    figmaWidth: guidelineBaseWidth,
    figmaHeight: guidelineBaseHeight,
  },
} as const;

// Helper function to get percentage-based dimensions
export const widthPercentage = (percentage: number): number => (width * percentage) / 100;
export const heightPercentage = (percentage: number): number => (height * percentage) / 100;