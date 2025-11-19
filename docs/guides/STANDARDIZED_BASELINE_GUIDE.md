# TindaGo Standardized Baseline Guide

## 📐 Official Design Baseline

**All TindaGo screens MUST use this baseline:**
- **Width:** 440px
- **Height:** 956px

This is the viewport size for responsive scaling. Scrollable content can exceed this height.

---

## ✅ Why This Matters

Using a **single, consistent baseline** ensures:
1. ✅ **Consistent scaling** across all screens
2. ✅ **Same visual proportions** between pages
3. ✅ **No jarring transitions** when navigating
4. ✅ **Predictable behavior** on all devices

---

## 🎯 Responsive Scaling System

### Scaling Functions (from `src/constants/responsive.ts`)

```typescript
import { s, vs, ms } from '@/constants/responsive';

// Horizontal scaling (width, left, right, margin, padding)
s(size)    // Example: s(400) → scales to device width

// Vertical scaling (height, top, bottom, margin, padding)
vs(size)   // Example: vs(50) → scales to device height

// Moderate scaling (font sizes - less aggressive)
ms(size, factor)   // Example: ms(16) → scales text moderately
```

### When to Use Each Function

| Property | Function | Example |
|----------|----------|---------|
| `width`, `marginLeft`, `paddingHorizontal` | `s()` | `width: s(400)` |
| `height`, `marginTop`, `paddingVertical` | `vs()` | `height: vs(50)` |
| `fontSize`, `lineHeight` | `ms()` | `fontSize: ms(16)` |

---

## 📱 Device Compatibility

### Tested Devices

All screens are tested and verified to work on:

| Device | Resolution | Scale Factor | Status |
|--------|------------|--------------|--------|
| **Realme 8** | 360×800 | 81.8% | ✅ Optimized |
| **Realme 8 Pro** | 393×851 | 89.3% | ✅ Perfect |
| **Redmi Note 12** | 393×873 | 89.3% | ✅ Perfect |
| **Redmi Note 12 Pro** | 412×915 | 93.6% | ✅ Perfect |
| **iPhone SE** | 375×667 | 85.2% | ✅ Perfect |
| **iPhone 14 Pro** | 393×852 | 89.3% | ✅ Perfect |
| **Samsung S21** | 360×800 | 81.8% | ✅ Optimized |
| **Google Pixel 6** | 412×915 | 93.6% | ✅ Perfect |

### Small Device Optimization

For devices with **360px width** (Realme 8, Samsung S21):
- Search bars and wide components use **390px** instead of 400px
- This provides **8-10px breathing room** on smallest devices
- Visual difference is minimal on larger devices

---

## 🛠️ Implementation Guide

### 1. Screen Documentation Template

Add this header to **every new screen**:

```typescript
/**
 * SCREEN NAME - DESCRIPTION
 *
 * Baseline: 440x956 (standard TindaGo viewport)
 * Uses responsive scaling for all devices
 *
 * Features:
 * - Feature 1
 * - Feature 2
 */
```

### 2. Component Styling Rules

```typescript
const styles = StyleSheet.create({
  // ✅ GOOD: Responsive with proper scaling
  container: {
    width: s(400),        // Horizontal scale
    height: vs(200),      // Vertical scale
    marginTop: vs(20),    // Vertical spacing
    paddingHorizontal: s(16), // Horizontal padding
  },

  text: {
    fontSize: ms(16),     // Moderate scale for text
    lineHeight: ms(16) * 1.5,
  },

  // ❌ BAD: Fixed sizes (never use these)
  badContainer: {
    width: 400,           // ❌ No scaling!
    height: 200,          // ❌ Will break on small devices
  },
});
```

### 3. Figma to Code Workflow

When converting Figma designs to code:

1. **Get Figma measurements** (x, y, width, height)
2. **Apply scaling functions:**
   ```typescript
   // Figma: x:20, y:100, width:400, height:50
   style: {
     position: 'absolute',
     left: s(20),       // x-coordinate
     top: vs(100),      // y-coordinate
     width: s(400),     // width
     height: vs(50),    // height
   }
   ```
3. **Add Figma coordinate comments:**
   ```typescript
   // Header - Figma: x:0, y:0, width:440, height:200
   header: {
     width: s(440),
     height: vs(200),
   },
   ```

---

## 📊 Visual Scaling Example

### How Components Scale Across Devices

```
┌─────────────────────────────────────────────────┐
│ BASELINE (440x956) - 100% Scale                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ [==========  Search Bar  ==========] 400px  │ │
│ │                                              │ │
│ │ [Product] [Product] [Product]               │ │
│ │  120px     120px     120px                   │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ REALME 8 (360x800) - 81.8% Scale                │
│ ┌───────────────────────────────────────────┐   │
│ │ [========  Search Bar  ========] 319px   │   │
│ │                                           │   │
│ │ [Product] [Product] [Product]            │   │
│ │  98px      98px      98px                 │   │
│ └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ REDMI NOTE 12 (393x873) - 89.3% Scale           │
│ ┌─────────────────────────────────────────────┐ │
│ │ [=========  Search Bar  =========] 348px   │ │
│ │                                             │ │
│ │ [Product] [Product] [Product]              │ │
│ │  107px     107px     107px                  │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Notice:** Same structure, different sizes - proportionally scaled!

---

## 🎨 Current Screen Status

### ✅ Standardized Screens

| Screen | Path | Baseline | Status |
|--------|------|----------|--------|
| **Customer Home** | `app/(main)/(customer)/home.tsx` | 440×956 | ✅ Standardized |
| **See More** | `app/(main)/(customer)/see-more.tsx` | 440×956 | ✅ Standardized |
| **Customer Profile** | `app/(main)/(customer)/profile/index.tsx` | 440×956 | ✅ Standardized |
| **Account Settings** | `app/(main)/(customer)/profile/account-settings.tsx` | 440×956 | ✅ Standardized |

### 📝 Future Screens

**All new screens must:**
1. Use 440×956 baseline
2. Apply responsive scaling (`s`, `vs`, `ms`)
3. Include baseline documentation
4. Test on small devices (360px)

---

## 🔍 Quality Checklist

Before committing a new screen, verify:

- [ ] Baseline is documented as 440×956
- [ ] All dimensions use scaling functions
- [ ] No hardcoded pixel values
- [ ] Figma coordinates are commented
- [ ] Tested on 360px width devices
- [ ] Search bars use 390px width (not 400px)
- [ ] Text uses moderate scaling (`ms`)

---

## 🚀 Testing Process

### 1. Development Testing

```bash
npx expo start
# Test on:
# - iOS Simulator (iPhone SE, iPhone 14 Pro)
# - Android Emulator (360px, 393px, 412px widths)
```

### 2. Device Testing

```bash
npx expo start
# Scan QR code with Expo Go on:
# - Realme 8 (360px)
# - Redmi Note 12 (393px)
# - Any other target device
```

### 3. Visual Verification

Check for:
- ✅ All content visible (no cropping)
- ✅ Proper spacing (not too tight)
- ✅ Readable text
- ✅ Easy-to-tap buttons
- ✅ No horizontal scrolling
- ✅ Consistent structure across screens

---

## 📚 Additional Resources

- **Responsive Constants:** `src/constants/responsive.ts`
- **Responsive Design Explanation:** `RESPONSIVE_DESIGN_EXPLANATION.md`
- **Figma Integration:** See `doc/TindaGo-Design-to-Code-Agent.md`

---

## ⚠️ Common Mistakes to Avoid

### ❌ Wrong: Mixed Baselines
```typescript
// home.tsx uses 440x1827
// see-more.tsx uses 440x956
// Result: Inconsistent scaling!
```

### ✅ Right: Single Baseline
```typescript
// All screens use 440x956
// Result: Consistent scaling everywhere!
```

### ❌ Wrong: Hardcoded Sizes
```typescript
width: 400,  // Won't scale!
height: 50,  // Breaks on small devices!
```

### ✅ Right: Responsive Scaling
```typescript
width: s(400),   // Scales to device
height: vs(50),  // Works everywhere!
```

### ❌ Wrong: Using `s()` for Height
```typescript
height: s(50),  // Wrong scale direction!
```

### ✅ Right: Using `vs()` for Height
```typescript
height: vs(50),  // Correct vertical scale!
```

---

## 🎯 Summary

**Golden Rules:**
1. 📐 **Always use 440×956 baseline**
2. 🔧 **Always use scaling functions** (`s`, `vs`, `ms`)
3. 📱 **Test on 360px devices** (smallest common size)
4. 📝 **Document baseline** in screen comments
5. ✅ **Verify consistency** across all screens

**Result:** Beautiful, responsive app that works on **ALL devices**! 🎉

---

*Last updated: 2025-10-10*
*Verified on: Realme 8, Redmi Note 12, iPhone SE, Samsung S21, Pixel 6*
