/**
 * TindaGo Typography System
 * Based on Figma design specifications
 */
export const Fonts = {
  // Font Families
  primary: 'Clash Grotesk Variable',
  secondary: 'ABeeZee',
  
  // Font Sizes
  sizes: {
    xl: 28,
    lg: 20,
    md: 18,
    sm: 17,
    xs: 14,
  },
  
  // Font Weights
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  
  // Line Heights
  lineHeights: {
    tight: 1.1,
    normal: 1.22,
    relaxed: 1.29,
  },
  
  // Backward compatibility aliases (uppercase)
  REGULAR: 'Clash Grotesk Variable',
  MEDIUM: 'Clash Grotesk Variable',
  SEMIBOLD: 'Clash Grotesk Variable',
  BOLD: 'Clash Grotesk Variable',
  primaryBold: 'Clash Grotesk Variable',
} as const;

export type FontSizes = keyof typeof Fonts.sizes;
export type FontWeights = keyof typeof Fonts.weights;