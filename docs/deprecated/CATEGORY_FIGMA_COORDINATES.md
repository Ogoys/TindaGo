# Category Section - Figma Coordinate Reference

## Figma Design Analysis
**File:** 8I1Nr3vQZllDDknSevstvH (TindaGo Share)
**Node:** 1057-4072 (Category Screen)
**Frame Dimensions:** 440x1480px

---

## Visual Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  Category Screen (440x1480)                         │
│  Background: #F4F6F6                                │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [0, 0] Status Bar (439.5x54)                       │
│  ├─ Time: "9:41" at (51.92, 18.34)                 │
│  └─ Levels: Battery, WiFi, Cellular at (299, 0)    │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [20, 79] Header (400x40)                           │
│  ├─ Back Button: (20, 79) 30x30                     │
│  ├─ Title "Categories": (171, 83) 98x22             │
│  └─ Notification: (375, 74) 40x40                   │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  CATEGORIES GRID (2 columns, starting at y:164)     │
│                                                      │
│  ┌────────────┐        ┌────────────┐               │
│  │  Cat 1     │        │  Cat 2     │               │
│  │ [20, 164]  │        │ [228, 164] │               │
│  │ 192x220    │        │ 192x220    │               │
│  │            │        │            │               │
│  │  Fruits &  │        │  Dairy &   │               │
│  │ Vegetables │        │  Bakery    │               │
│  │            │        │            │               │
│  │   ●────    │        │   ●────    │               │
│  │  / 90x90   │        │  / 90x90   │               │
│  │ ○  Circle  │        │ ○  Circle  │               │
│  └────────────┘        └────────────┘               │
│                                                      │
│  ┌────────────┐        ┌────────────┐               │
│  │  Cat 3     │        │  Cat 4     │               │
│  │ [20, 404]  │        │ [228, 404] │               │
│  │ 192x220    │        │ 192x220    │               │
│  └────────────┘        └────────────┘               │
│                                                      │
│  ... (continues for all 10 categories)              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Detailed Component Coordinates

### 1. Header Components

#### Back Button
```
Position: (20, 79)
Size: 30x30px
Style:
  - borderRadius: 20px
  - backgroundColor: #FFFFFF
  - shadow: 0px 0px 4px rgba(0,0,0,0.25)

Icon:
  - chevron-left.png
  - Size: 15x15px
  - Position: centered in button
```

#### Title "Categories"
```
Position: (171, 83)
Size: 98x22px
Typography:
  - fontFamily: Clash Grotesk Variable
  - fontWeight: 500
  - fontSize: 20px
  - lineHeight: 1.1em (22px)
  - color: #1E1E1E
  - textAlign: CENTER
```

#### Notification Button
```
Position: (375, 74)
Size: 40x40px
Components:
  - Circle Background:
      - borderRadius: 20px
      - backgroundColor: #FFFFFF
      - shadow: 0px 0px 10px 2px rgba(0,0,0,0.25)
  - Icon:
      - notification-icon.png
      - Position: (382, 81) = (7, 7) relative
      - Size: 25x25px
```

---

### 2. Category Card Structure

Each category card follows this exact structure:

#### Card Container
```
Position:
  - Left column: x=20
  - Right column: x=228
  - Spacing between columns: 208px (228-20)
  - Vertical spacing: 240px between rows (220 card + 20 gap)

Size: 192x220px
Style:
  - borderRadius: 20px
  - backgroundColor: #FFFFFF
  - shadow: 0px 0px 5px rgba(0,0,0,0.25)
```

#### Category Name Text
```
Position: varies by category (centered horizontally)
  - Example: "Fruits & Vegetables" at (34, 20) relative to card
  - Example: "Dairy & Bakery" at (55, 20) relative to card

Typography:
  - fontFamily: Clash Grotesk Variable
  - fontWeight: 600
  - fontSize: 24px
  - lineHeight: 0.917em (22px)
  - textAlign: CENTER
  - color: varies by category
```

#### Bottom Decoration Background
```
Position: (0, 140) relative to card
Size: 192x80px
Style:
  - Positioned at bottom of card
  - Uses category-specific background image
  - borderRadius: 0px 0px 20px 20px (bottom corners only)
```

#### Icon Circle
```
Position: (51, 85) relative to card = centered horizontally
Size: 90x90px
Style:
  - borderRadius: 45px (perfect circle)
  - backgroundColor: varies by category (with 60% opacity)
  - shadow: 0px 0px 5px rgba(0,0,0,0.25)
```

#### Category Icon
```
Position: (20, 20) relative to circle = centered
Size: 50x50px
Style:
  - resizeMode: FILL
  - Centered within 90x90 circle
```

---

## Category Grid Layout (Y-Coordinates)

```
Row 1:
  - Cat 1 (Fruits & Vegetables):  y=164
  - Cat 2 (Dairy & Bakery):       y=164

Row 2:
  - Cat 3 (Snacks & Sweets):      y=404
  - Cat 4 (Beverages):            y=404

Row 3:
  - Cat 5 (Personal & Baby Care): y=644
  - Cat 6 (Home & Kitchen):       y=644

Row 4:
  - Cat 7 (Staple Foods):         y=884
  - Cat 8 (Condiments & Cooking): y=884

Row 5:
  - Cat 9 (Frozen Goods):         y=1124
  - Cat 10 (Miscellaneous):       y=1124
```

**Vertical Spacing Calculation:**
- Card height: 220px
- Gap between rows: 20px
- Next row position: previous_y + 220 + 20 = previous_y + 240

---

## Home Page Category Section Implementation

### Differences from Full Category Screen:

The home page uses a **horizontal scrollable version** instead of the 2-column grid:

```typescript
// Home page category section
categorySection: {
  marginTop: vs(10),
  height: vs(100),        // Reduced height for horizontal layout
  marginBottom: vs(10),
}

// Category items in horizontal scroll
categoryItem: {
  alignItems: "center",
  marginRight: s(15),     // Horizontal spacing
  width: s(80),           // Fixed width per item
}
```

### Category Icon Circle (Same as Full Screen):
```typescript
categoryIconCircle: {
  width: s(50),           // Figma: 50x50
  height: s(50),
  borderRadius: s(25),
  backgroundColor: "#FFFFFF",
  shadowColor: "rgba(0, 0, 0, 0.25)",
  shadowOffset: { width: 0, height: vs(4) },
  shadowOpacity: 1,
  shadowRadius: s(10),
  elevation: 10,
}
```

### Category Icon (Same as Full Screen):
```typescript
categoryIcon: {
  width: s(30),           // Figma: 30x30 (centered in 50x50 circle)
  height: s(30),
}
```

---

## Color Palette

### Category-Specific Colors:

```typescript
Categories = {
  "Fruits & Vegetables": {
    text: "#3BB77E",
    circle: "rgba(59, 183, 126, 0.6)"
  },
  "Dairy & Bakery": {
    text: "#D39447",
    circle: "rgba(211, 148, 71, 0.6)"
  },
  "Snacks & Sweets": {
    text: "#B34F2D",
    circle: "rgba(179, 79, 45, 0.6)"
  },
  "Beverages": {
    text: "#646A8A",
    circle: "rgba(100, 106, 138, 0.6)"
  },
  "Personal & Baby Care": {
    text: "#945DA1",
    circle: "rgba(148, 93, 161, 0.6)"
  },
  "Home & Kitchen": {
    text: "#2788BB",
    circle: "rgba(39, 136, 187, 0.6)"
  },
  "Staple Foods": {
    text: "#F15A8D",
    circle: "rgba(241, 90, 141, 0.6)"
  },
  "Condiments & Cooking": {
    text: "#787161",
    circle: "rgba(120, 113, 97, 0.6)"
  },
  "Frozen Goods": {
    text: "#A4E0E3",
    circle: "rgba(103, 204, 209, 0.6)"
  },
  "Miscellaneous & Others": {
    text: "#765640",
    circle: "rgba(118, 86, 64, 0.6)"
  }
}
```

### Global Colors:

```typescript
Background = "#F4F6F6"      // Page background
White = "#FFFFFF"           // Card backgrounds, buttons
Shadow = "rgba(0,0,0,0.25)" // Standard shadow color
Title = "#1E1E1E"           // Header title color
```

---

## Responsive Scaling Functions

All coordinates use the TindaGo baseline scaling system:

```typescript
// Baseline: 440x956 (standard TindaGo)
import { s, vs, ms } from "../../../src/constants/responsive";

// Horizontal scaling
width: s(50)    // 50px → scales based on device width

// Vertical scaling
height: vs(50)  // 50px → scales based on device height

// Moderate scaling (for fonts)
fontSize: ms(20) // 20px → scales with 50% factor
```

---

## Asset File Mapping

### Downloaded from Figma:

```
Node ID → Filename → Usage
─────────────────────────────────────────────────────
1057:4087 → fruits-vegetables.png → Fruits & Vegetables icon
1057:4141 → dairy-bakery.png → Dairy & Bakery icon
1057:4096 → snacks.png → Snacks & Sweets icon
1057:4150 → beverages.png → Beverages icon
1057:4105 → personal-care.png → Personal & Baby Care icon
1057:4159 → home-kitchen.png → Home & Kitchen icon
1057:4114 → staple-foods.png → Staple Foods icon
1057:4168 → condiments-cooking.png → Condiments & Cooking icon
1057:4123 → frozen-goods.png → Frozen Goods icon
1057:4132 → miscellaneous.png → Miscellaneous & Others icon
1057:4075 → notification-icon.png → Notification button
1057:4077 → chevron-left.png → Back button
```

All icons exported at **3x scale** (150x150px actual size for 50x50px Figma design).

---

## Implementation Notes

### Pixel-Perfect Matching:
✅ All coordinates extracted directly from Figma
✅ Responsive scaling applied using baseline functions
✅ Shadow effects match Figma specifications exactly
✅ Typography uses exact font sizes and line heights
✅ Colors use exact hex values from Figma

### Home Page Adaptation:
- Converted 2-column grid → horizontal scroll
- Maintained exact icon sizes (50x50 circle, 30x30 icon)
- Kept same visual styling and shadows
- Added navigation to full category screen
- Preserved all 10 categories in same order

### Future Enhancement:
Consider implementing category filtering when tapping items:
```typescript
onPress={() => router.push(`/category?filter=${category.id}`)}
```

This would allow users to filter products by category directly from the home page.
