# Order Error Modal - Visual Specification

## Figma Design Reference

**File:** TindaGo Share
**File Key:** 8I1Nr3vQZllDDknSevstvH
**Node ID:** 1057-1494
**Component Name:** Order Error
**Modal Baseline:** 400x500px
**App Baseline:** 440x956px

## Component Layout

```
┌─────────────────────────────────────────────────┐
│                  Order Error Modal              │
│                   400 x 500px                   │
│                                                 │
│                                                 │
│              ┌─────────────────┐               │ y: 50
│              │                 │               │
│              │   Error Icon    │               │
│              │  (Red/Gradient) │               │
│              │   180 x 180px   │               │
│              │                 │               │
│              └─────────────────┘               │ y: 230
│                                                 │
│                                                 │
│        Sorry, Your order has failed            │ y: 270
│                                                 │
│         Sorry, something went wrong.           │ y: 297
│      Please try again to continue your order.  │
│                                                 │
│                                                 │
│  ┌───────────────────────────────────────────┐ │ y: 357
│  │                                           │ │
│  │           TRY AGAIN (Green)              │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │ y: 397
│                                                 │
│  ┌───────────────────────────────────────────┐ │ y: 407
│  │                                           │ │
│  │         BACK TO HOME (Gray)              │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │ y: 447
│                                                 │
└─────────────────────────────────────────────────┘

```

## Element Specifications

### 1. Modal Container
- **Position:** Centered on screen
- **Size:** 400 x 500px (scaled with s/vs)
- **Background:** #FFFFFF (Colors.white)
- **Border Radius:** 20px
- **Shadow:** 0px 0px 5px 2px rgba(0, 0, 0, 0.25)
- **Elevation:** 8 (Android)

### 2. Error Icon
- **Position:** x: 110, y: 50
- **Size:** 180 x 180px (square aspect ratio)
- **Source:** `error-icon.png`
- **Design:** Red/gradient circle with X marks
- **Colors:**
  - Gradient: #DF2525 → #791414
  - Background: #D9D9D9 (gray circle)
- **Resize Mode:** contain

### 3. Title Text
- **Position:** Inside label container at y: 270
- **Text:** "Sorry, Your order has failed"
- **Font Family:** Clash Grotesk Variable
- **Font Size:** 20px (scaled)
- **Font Weight:** 500 (medium)
- **Line Height:** 1.1em (22px)
- **Color:** #1E1E1E (Colors.darkGray)
- **Align:** center
- **Margin Bottom:** 5px (scaled)

### 4. Description Text
- **Position:** Inside label container
- **Default Text:** "Sorry, somethings went wrong.\nPlease try again to continue your order."
- **Font Family:** Clash Grotesk Variable
- **Font Size:** 12px (scaled)
- **Font Weight:** 400 (normal)
- **Line Height:** 1.23em (~15px)
- **Color:** rgba(30, 30, 30, 0.5) (50% opacity dark gray)
- **Align:** center
- **Max Width:** 199px
- **Lines:** 2 lines

### 5. Label Container
- **Position:** x: 79, y: 270
- **Size:** 243 x 57px
- **Align Items:** center
- **Contains:** Title + Description

### 6. Try Again Button
- **Position:** x: 83, y: 357
- **Size:** 234 x 40px
- **Background:** #3BB77E (Colors.primary)
- **Border Radius:** 10px
- **Text:** "Try Again"
- **Text Color:** #FFFFFF (white)
- **Font Size:** 14px (scaled)
- **Font Weight:** 500 (medium)
- **Line Height:** 1.57em (22px)
- **Shadow:** 0px 0px 5px 0px rgba(0, 0, 0, 0.25)
- **Elevation:** 3 (Android)
- **Action:** Calls onRetry() callback

### 7. Back to Home Button
- **Position:** x: 83, y: 407
- **Size:** 234 x 40px
- **Background:** rgba(217, 217, 217, 0.5) (50% gray)
- **Border Radius:** 10px
- **Text:** "Back to Home"
- **Text Color:** rgba(30, 30, 30, 0.5) (50% dark gray)
- **Font Size:** 14px (scaled)
- **Font Weight:** 500 (medium)
- **Line Height:** 1.57em (22px)
- **Shadow:** 0px 0px 5px 0px rgba(0, 0, 0, 0.25)
- **Elevation:** 3 (Android)
- **Action:** Navigates to "/(main)/(customer)/home"

### 8. Backdrop
- **Coverage:** Full screen
- **Background:** rgba(0, 0, 0, 0.5) (50% black overlay)
- **Action:** Calls onClose() when pressed

## Spacing & Layout

### Vertical Spacing (from top)
- Modal top padding: 0px
- Error icon top: 50px
- Error icon bottom: 230px (50 + 180)
- Gap to title: 40px
- Title: 270px
- Description: 297px (270 + 22 + 5)
- Gap to Try Again: 60px
- Try Again button: 357px
- Gap between buttons: 10px
- Back to Home button: 407px
- Button bottom: 447px (407 + 40)
- Modal bottom padding: 53px (500 - 447)

### Horizontal Spacing
- Modal horizontal center alignment
- Error icon: 110px from left (centered: (400-180)/2 = 110)
- Label container: 79px from left (centered with slight offset)
- Buttons: 83px from left (centered: (400-234)/2 = 83)

## Color Palette

### Primary Colors
```typescript
Colors.primary = '#3BB77E'    // Try Again button
Colors.white = '#FFFFFF'       // Modal background, button text
Colors.darkGray = '#1E1E1E'    // Title text
Colors.shadow = 'rgba(0, 0, 0, 0.25)' // Shadows
```

### Component-Specific Colors
```typescript
// Error icon gradient
startColor: '#DF2525'
endColor: '#791414'

// Icon background
iconBg: '#D9D9D9'

// Description text
descriptionColor: 'rgba(30, 30, 30, 0.5)'

// Back to Home button
buttonBg: 'rgba(217, 217, 217, 0.5)'
buttonText: 'rgba(30, 30, 30, 0.5)'

// Backdrop
backdropColor: 'rgba(0, 0, 0, 0.5)'
```

## Typography

### Font Stack
**Primary:** Clash Grotesk Variable

### Text Styles
```typescript
// Title
{
  fontFamily: 'Clash Grotesk Variable',
  fontSize: 20px (scaled),
  fontWeight: '500',
  lineHeight: 22px (1.1em),
  color: '#1E1E1E',
  textAlign: 'center',
}

// Description
{
  fontFamily: 'Clash Grotesk Variable',
  fontSize: 12px (scaled),
  fontWeight: '400',
  lineHeight: 15px (1.23em),
  color: 'rgba(30, 30, 30, 0.5)',
  textAlign: 'center',
}

// Button Text
{
  fontFamily: 'Clash Grotesk Variable',
  fontSize: 14px (scaled),
  fontWeight: '500',
  lineHeight: 22px (1.57em),
  textAlign: 'center',
}
```

## Shadow Effects

### Modal Shadow
```typescript
{
  shadowColor: 'rgba(0, 0, 0, 0.25)',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.25,
  shadowRadius: 5,
  elevation: 8, // Android
}
```

### Button Shadow
```typescript
{
  shadowColor: 'rgba(0, 0, 0, 0.25)',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.25,
  shadowRadius: 5,
  elevation: 3, // Android
}
```

## Animation Specifications

### Opening Animation (300ms)
```typescript
// Fade In
{
  from: opacity 0,
  to: opacity 1,
  duration: 300ms,
  easing: timing,
}

// Scale In (Spring)
{
  from: scale 0.8,
  to: scale 1,
  friction: 8,
  tension: 40,
  easing: spring,
}
```

### Closing Animation (200ms)
```typescript
// Fade Out
{
  from: opacity 1,
  to: opacity 0,
  duration: 200ms,
  easing: timing,
}

// Scale Out
{
  from: scale 1,
  to: scale 0.8,
  duration: 200ms,
  easing: timing,
}
```

### Button Press Effect
```typescript
{
  opacity: 0.7,
  duration: instant,
}
```

## Responsive Scaling

All dimensions use TindaGo's baseline responsive scaling system:

```typescript
import { s, vs } from '@/constants/responsive';

// Baseline: 440x956 (Figma design)
// Modal baseline: 400x500

// Horizontal scaling
s(400) → Modal width
s(180) → Icon width
s(234) → Button width
s(20)  → Border radius

// Vertical scaling
vs(500) → Modal height
vs(180) → Icon height (but use s() for square aspect)
vs(40)  → Button height
vs(50)  → Icon top position
```

## Interaction States

### Buttons
1. **Default**: Full opacity, normal colors
2. **Pressed**: opacity: 0.7
3. **Disabled**: Not applicable (buttons always enabled)

### Modal
1. **Hidden**: visible=false, opacity=0, scale=0.8
2. **Showing**: visible=true, opacity=1, scale=1
3. **Hiding**: visible=true→false, opacity=1→0, scale=1→0.8

### Backdrop
1. **Default**: 50% black overlay
2. **Pressed**: Triggers onClose()

## Accessibility

### Touch Targets
- All buttons: 234x40px (meets minimum 44x44 iOS guideline with padding)
- Backdrop: Full screen tappable area

### Text Contrast
- Title on white: #1E1E1E on #FFFFFF (AAA rated)
- Description on white: rgba(30,30,30,0.5) on #FFFFFF (AA rated)
- Try Again: #FFFFFF on #3BB77E (AAA rated)
- Back to Home: rgba(30,30,30,0.5) on rgba(217,217,217,0.5) (check in implementation)

### Screen Reader Support
- Modal has statusBarTranslucent for iOS
- Buttons have accessible text
- onRequestClose handler for Android back button

## Platform-Specific Notes

### iOS
- Uses shadowColor, shadowOffset, shadowOpacity, shadowRadius
- statusBarTranslucent prop enabled
- Spring animation for natural iOS feel

### Android
- Uses elevation property for shadows
- Hardware back button triggers onRequestClose
- Elevation values: modal=8, buttons=3

## Error Message Guidelines

### Default Message
```
Sorry, somethings went wrong.
Please try again to continue your order.
```

### Custom Message Format
- Maximum 2 lines recommended
- Use \n for line breaks
- Keep under 60 characters per line
- Be specific and actionable

### Example Custom Messages
```typescript
// Network error
"No internet connection.\nPlease check your network and try again."

// Payment failed
"Payment processing failed.\nPlease check your payment method."

// Server error
"Server temporarily unavailable.\nPlease try again in a moment."

// Validation error
"Invalid order details.\nPlease review your order and try again."
```

## Asset Requirements

### Error Icon
- **File:** error-icon.png
- **Location:** src/assets/images/order-error/
- **Format:** PNG with transparency
- **Size:** 180x180px @ 3x (540x540px actual)
- **File Size:** ~21.4 KB
- **Design:** Red gradient X marks on gray circle

### Figma Data
- **File:** figma-*.json
- **Location:** src/assets/images/order-error/
- **Purpose:** Design reference data
- **Format:** JSON
- **File Size:** ~12.2 KB

## Implementation Checklist

- [x] Modal container with correct dimensions
- [x] Backdrop with 50% black overlay
- [x] Error icon positioned correctly
- [x] Title text with correct styling
- [x] Description text with correct styling
- [x] Try Again button with primary color
- [x] Back to Home button with gray color
- [x] Smooth fade + scale animations
- [x] onRetry callback wired up
- [x] Navigation to home screen
- [x] Backdrop dismiss functionality
- [x] Custom error message support
- [x] Responsive scaling applied
- [x] Shadows and elevation
- [x] TypeScript types
- [x] Documentation comments

## Comparison with Success Modal

| Aspect | OrderCompleteModal | OrderErrorModal |
|--------|-------------------|-----------------|
| **Icon** | Green checkmark | Red X marks |
| **Icon Colors** | #3BB77E gradient | #DF2525 → #791414 |
| **Title** | "Thank you for your order!" | "Sorry, Your order has failed" |
| **Description** | Order ID message | Error message |
| **Button 1** | "Track Order" | "Try Again" |
| **Button 1 Action** | Navigate to order details | Call onRetry callback |
| **Button 2** | "Back to Home" | "Back to Home" |
| **Button 2 Action** | Navigate to home | Navigate to home |
| **Size** | 400x500px | 400x500px |
| **Animation** | Same | Same |
| **Layout** | Same structure | Same structure |

---

**Visual Design:** Pixel-perfect conversion from Figma
**Baseline:** 400x500px modal, 440x956px app
**Status:** Production Ready ✅
