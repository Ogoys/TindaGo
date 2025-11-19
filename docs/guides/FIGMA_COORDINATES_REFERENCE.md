# Figma Coordinates Reference - Customer Home Screen

**Complete pixel-perfect coordinate mapping from Figma to React Native**

---

## Screen Layout (440x1827px)

```
┌─────────────────────────────────────────┐
│  HEADER SECTION (0, 0, 440, 230)        │
│  - Background: Teal gradient            │
│  - Profile (20, 74, 179, 40)            │
│  - Notification (375, 74, 40, 40)       │
│  - Search Bar (20, 134, 400, 50)        │
├─────────────────────────────────────────┤
│  CATEGORY SCROLL (1, 198, 439, 90)      │
├─────────────────────────────────────────┤
│  BEST SELLING (Label: 23, 296)          │
│  - Products Scroll (1, 330, 440, 244)   │
├─────────────────────────────────────────┤
│  FEATURED STORES (Label: 23, 584)       │
│  - Store Cards (20, 628, 400, 660)      │
│    * Card 1: y:0                        │
│    * Card 2: y:170                      │
│    * Card 3: y:340                      │
│    * Card 4: y:510                      │
├─────────────────────────────────────────┤
│  POPULAR PICKS (Label: 23, 1308)        │
│  ⬆ MOVED HERE (was below Fresh Finds)   │
│  - Cards Scroll (0, 1332, 440, 100)     │
├─────────────────────────────────────────┤
│  FRESH FINDS (Label: 24, 1442)          │
│  - Products Scroll (0, 1486, 440, 244)  │
├─────────────────────────────────────────┤
│  END MESSAGE (174, 1750)                │
└─────────────────────────────────────────┘
│  BOTTOM NAVIGATION (0, bottom, 440,120) │
└─────────────────────────────────────────┘
```

---

## Header Section Details

### Profile Section (Figma: 759:593)
```
Position: (20, 74, 179, 40)

├─ Logo Circle (759:594)
│  Position: (0, 0, 40, 40)
│  Style: Blue circle, white text "DO"
│
├─ User Name (759:599)
│  Position: (70, 74, 106, 22)
│  Text: "Daniel Oppa"
│  Font: 20px, weight:500, color:#FFFFFF
│
└─ Location (759:6373)
   Position: (70, 92, 129, 22)
   ├─ Icon (759:598): 15x15px
   └─ Text: "Jacinto st. Davao City"
      Font: 12px, weight:400, color:#FFFFFF
```

### Notification Button (Figma: 759:205)
```
Position: (375, 74, 40, 40)

├─ Circle Background (759:206)
│  40x40px, white, shadow
│
└─ Icon (759:207)
   Position: (7, 7, 25, 25)
   Asset: notification-icon.png
```

### Search Bar (Figma: 759:208)
```
Position: (20, 134, 400, 50)

├─ Background (759:209)
│  400x50px, white, radius:20px, shadow
│
├─ Icon (759:210)
│  Position: (20, 15, 20, 20)
│  Asset: search-icon.png
│
└─ Input (759:211)
   Position: (60, 15)
   Placeholder: 'Search for "Items"'
   Font: 16px, weight:500, color:#7A7B7B
```

---

## Product Card (Figma: 759:266)

```
Dimensions: 120 x 222px
Node Structure:

Product Card (0, 0, 120, 222)
│
├─ Background (759:267)
│  Rectangle 16: 120x222px, white, radius:20px
│  Shadow: 0px 0px 10px rgba(0,0,0,0.25)
│
├─ Picture Container (759:268) → (0, 12, 120, 88)
│  │
│  ├─ Gray Background (759:269) → (10, 0, 100, 88)
│  │  Color: #E9E9E9, radius:10px
│  │  Shadow: 0px 4px 10px 2px rgba(0,0,0,0.25)
│  │
│  └─ Product Image (759:270) → (0, 4, 120, 80)
│     Asset: garlic.png
│     ImageRef: 6c0d125c739fdc249e00325ee74d0bba9c1352fc
│
├─ Label Container (759:271) → (27, 111, 65, 66)
│  │
│  ├─ Name (759:272) → (12, 0)
│  │  Text: "Garlic"
│  │  Font: 16px, weight:500, color:#1E1E1E
│  │
│  ├─ Shop (759:273) → (0, 22)
│  │  Text: "(Local shop)"
│  │  Font: 12px, weight:500, color:#1E1E1E
│  │
│  └─ Weight (759:274) → (17, 44)
│     Text: "500g"
│     Font: 12px, weight:500, color:rgba(0,0,0,0.5)
│
└─ Add Button (759:275) → (10, 179, 100, 30)
   │
   ├─ Background (759:276)
   │  Rectangle 19: 100x30px, #EBF3DA, radius:5px
   │  Shadow: 0px 0px 5px rgba(0,0,0,0.25)
   │
   └─ Plus Icon (759:277) → (45, 12, 10, 10)
      Asset: plus-icon.png
      ImageRef: 936d06e5a2581f2ef0ab264496f867eeb0cf1d7b
```

---

## Popular Pick Card (Figma: 759:520)

```
Dimensions: 180 x 80px
Node Structure:

Popular Pick Card (0, 0, 180, 80)
│
├─ Background (759:521)
│  Rectangle 22: 180x80px, white, radius:20px
│  Shadow: 0px 4px 10px 2px rgba(0,0,0,0.25)
│
├─ Picture Container (759:522) → (10, 10, 60, 60)
│  │
│  ├─ Picture Background (759:523) → (0, 0, 60, 60)
│  │  Color: #FFFFFF, radius:16px
│  │  Shadow: 0px 0px 4px 2px rgba(0,0,0,0.25)
│  │
│  └─ Product Image (759:524) → (13, 10, 33, 40)
│     Asset: broccoli.png
│     ImageRef: 4557eae8cb1c1198366248b74c592c8be8cad371
│
└─ Labels Container (759:525) → (80, 13, 75, 55)
   │
   ├─ Name (759:527) → (0, 0)
   │  Text: "Brocoli"
   │  Font: 16px, weight:500, color:#1E1E1E
   │
   ├─ Description (759:528) → (0, 16)
   │  Text: "Fresh from farm"
   │  Font: 10px, weight:500, lineHeight:2.2, color:rgba(0,0,0,0.5)
   │
   └─ Price (759:526) → (0, 33)
      Text: "₱100"
      Font: 12px, weight:500, color:#1E1E1E
```

---

## Bottom Navigation (Figma: 759:610)

```
Dimensions: 440 x 120px
Component ID: 20:5 (Nav bar, Property 1=Home)

Navigation Bar (0, 0, 440, 120)
│
├─ Background (I759:610;47:9)
│  Rectangle 28: 440x120px, white
│
├─ HOME TAB (I759:610;61:45) → (35, 50, 31, 52)
│  │
│  ├─ Icon (I759:610;61:18) → (0, 0, 30, 30)
│  │  HomeOutline: Green stroke when active
│  │  Stroke: #3BB77E, weight:2px
│  │  Asset: nav-home-active.png
│  │
│  └─ Label (I759:610;61:35) → (0, 30)
│     Text: "Home"
│     Font: 12px, weight:400
│     Active: #1E1E1E, Inactive: rgba(30,30,30,0.5)
│
├─ ORDERS TAB (I759:610;61:47) → (126, 51, 38, 51)
│  │
│  ├─ Icon (I759:610;61:38) → (4, 0, 30, 30)
│  │  NewspaperOutline
│  │  Stroke: rgba(30,30,30,0.5), weight:2px
│  │  Asset: nav-orders.png
│  │
│  └─ Label (I759:610;61:36) → (0, 29)
│     Text: "Orders"
│     Font: 12px, weight:400, color:rgba(30,30,30,0.5)
│
├─ CART BUTTON (I759:610;61:34) → (195, 20, 50, 50)
│  │  ⬆ ELEVATED ABOVE OTHER TABS
│  │
│  ├─ Circle (I759:610;61:33)
│  │  Ellipse 1: 50x50px, #3BB77E
│  │  Shadow: 0px 4px 5px rgba(0,0,0,0.25)
│  │
│  └─ Icon (I759:610;61:25) → (12, 12, 25, 25)
│     ShoppingCartOutline
│     Stroke: #FFFFFF, weight:2px
│     Asset: nav-cart.png
│
├─ CATEGORY TAB (I759:610;61:46) → (270, 50, 49, 52)
│  │
│  ├─ Icon (I759:610;61:29) → (10, 0, 30, 30)
│  │  MenuAlt2Outline
│  │  Stroke: rgba(30,30,30,0.5), weight:2px
│  │  Asset: nav-category.png
│  │
│  └─ Label (I759:610;61:40) → (0, 30)
│     Text: "Category"
│     Font: 12px, weight:400, color:rgba(30,30,30,0.5)
│
└─ PROFILE TAB (I759:610;61:44) → (373, 50, 33, 52)
   │
   ├─ Icon (I759:610;61:31) → (2, 0, 30, 30)
   │  UserOutline
   │  Stroke: rgba(30,30,30,0.5), weight:2px
   │  Asset: nav-profile.png
   │
   └─ Label (I759:610;61:42) → (0, 30)
      Text: "Profile"
      Font: 12px, weight:400, color:rgba(30,30,30,0.5)
```

---

## Store Card (Figma: 759:487)

```
Dimensions: 400 x 150px

Store Card (0, 0, 400, 150)
│
├─ White Background (759:488)
│  Rectangle 20: 399x150px, white, radius:20px
│  Shadow: 0px 4px 10px rgba(0,0,0,0.25)
│
├─ Store Image Background (759:489) → (1, 0, 399, 90)
│  Top portion, radius:20px on top corners
│
├─ Store Logo (759:490) → (10.97, 50, 29.93, 30)
│  Circular logo, 30x30px
│  Background: #3BB77E
│
├─ Store Name (759:491) → (10.97, 96)
│  Text: "Golis Sari-sari"
│  Font: 20px, weight:500, color:#1E1E1E
│
└─ Meta Container → (10.97, 117)
   │
   ├─ Star Icon (759:494) → (0, 6, 9.98, 10)
   │
   ├─ Rating (759:493) → (15, 0)
   │  Text: "5.0"
   │  Font: 12px, weight:400, color:rgba(0,0,0,0.5)
   │
   └─ Distance (759:492) → (42, 0)
      Text: "1.3 km"
      Font: 12px, weight:400, color:rgba(0,0,0,0.5)
```

---

## Responsive Scaling Implementation

All coordinates are scaled from the 440x956 baseline:

```typescript
import { s, vs } from '@/constants/responsive';

// Example Product Card implementation:
const styles = StyleSheet.create({
  productCard: {
    width: s(120),        // Horizontal scaling
    height: vs(222),      // Vertical scaling
  },

  productImage: {
    position: "absolute",
    left: 0,              // No scaling for 0
    top: vs(4),           // Vertical offset
    width: s(120),
    height: vs(80),
  },

  productName: {
    left: s(12),          // Horizontal offset
    top: 0,
    fontSize: 16,         // Font sizes NOT scaled
  },
});
```

**Scaling Formula**:
- `s(x)` = x * (screenWidth / 440)
- `vs(y)` = y * (screenHeight / 956)

---

## Color Palette (From Figma)

```typescript
const Colors = {
  // Primary
  primary: "#3BB77E",           // Green (active states, cart)
  tealHeader: "#02545F",        // Header background

  // Text
  textPrimary: "#1E1E1E",       // Dark gray (titles, names)
  textSecondary: "rgba(0, 0, 0, 0.5)",  // 50% opacity (metadata)
  searchPlaceholder: "#7A7B7B", // Gray (search input)

  // Backgrounds
  pageBackground: "#F4F6F6",    // Light gray
  cardWhite: "#FFFFFF",         // Cards, navigation
  productImageBg: "#E9E9E9",    // Product image background
  addButtonBg: "#EBF3DA",       // Light green (add buttons)

  // Shadows
  shadow: "rgba(0, 0, 0, 0.25)", // 25% black
};
```

---

## Typography Scale

```typescript
const Typography = {
  fontFamily: "Clash Grotesk Variable",

  sizes: {
    sectionTitle: 20,     // Best Selling, Featured Stores
    productName: 16,      // Product cards, popular picks
    seeMore: 14,          // "See more" links
    metadata: 12,         // Prices, weights, nav labels
    description: 10,      // Popular pick descriptions
  },

  weights: {
    normal: "400",        // Nav labels, metadata
    medium: "500",        // Most text
    semiBold: "600",      // Section titles
  },

  lineHeights: {
    tight: 1.1,           // Section titles (20px * 1.1)
    normal: 1.375,        // Product names (16px * 1.375)
    relaxed: 1.833,       // Metadata (12px * 1.833)
    loose: 2.2,           // Descriptions (10px * 2.2)
  },
};
```

---

## Shadow Definitions

```typescript
const Shadows = {
  card: {
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 10,
  },

  button: {
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: s(5),
    elevation: 5,
  },

  productImage: {
    shadowColor: "rgba(0, 0, 0, 0.25)",
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 1,
    shadowRadius: s(10),
    elevation: 10,
  },
};
```

---

## Border Radius Standards

```typescript
const BorderRadius = {
  card: s(20),              // Product cards, popular picks, stores
  button: s(5),             // Add buttons
  searchBar: s(20),         // Search input
  productImage: s(10),      // Product image background
  popularPickImage: s(16),  // Popular pick image background
  circle: s(25),            // Cart button, profile logo
};
```

---

**Reference Date**: October 7, 2025
**Figma File**: 8I1Nr3vQZllDDknSevstvH
**Node**: 759-203
**Baseline**: 440x1827px

All coordinates verified against Figma API extraction.
