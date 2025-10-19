# Order Complete Modal - Component Structure

## Visual Hierarchy

```
OrderCompleteModal (400x500px)
│
├── Backdrop (Full Screen Overlay)
│   ├── Background: rgba(0, 0, 0, 0.5)
│   └── Dismissable: Yes (onPress)
│
└── Modal Container (Animated)
    │
    └── Modal Content (White Card, 400x500px, borderRadius: 20px)
        │
        ├── 1. Approved Icon (x:110, y:50)
        │   ├── Size: 180x180px
        │   ├── Asset: approved-icon.png
        │   └── Type: Green checkmark with gradient
        │
        ├── 2. Label Container (x:83, y:270, width:234, height:57)
        │   │
        │   ├── Thank You Text (y:270)
        │   │   ├── Text: "Thank you for your order!"
        │   │   ├── Font: Clash Grotesk Variable, 20px, weight 500
        │   │   ├── Color: #1E1E1E (darkGray)
        │   │   └── Align: Center
        │   │
        │   └── Description Text (y:297)
        │       ├── Text: "Your order has been placed successfully. your order ID is #{orderId}"
        │       ├── Font: Clash Grotesk Variable, 12px, weight 400
        │       ├── Color: rgba(30, 30, 30, 0.5)
        │       └── Align: Center
        │
        ├── 3. Track Order Button (x:83, y:357, width:234, height:40)
        │   ├── Background: #3BB77E (primary green)
        │   ├── Border Radius: 10px
        │   ├── Shadow: 0px 0px 5px rgba(0, 0, 0, 0.25)
        │   ├── Text: "Track Order"
        │   ├── Font: Clash Grotesk Variable, 14px, weight 500
        │   ├── Text Color: #FFFFFF (white)
        │   └── Action: Navigate to order details screen
        │
        └── 4. Back to Home Button (x:83, y:407, width:234, height:40)
            ├── Background: rgba(217, 217, 217, 0.5) (light gray)
            ├── Border Radius: 10px
            ├── Shadow: 0px 0px 5px rgba(0, 0, 0, 0.25)
            ├── Text: "Back to Home"
            ├── Font: Clash Grotesk Variable, 14px, weight 500
            ├── Text Color: rgba(30, 30, 30, 0.5)
            └── Action: Navigate to customer home screen
```

## Component Layers (Z-Index)

```
┌─────────────────────────────────────┐
│  Layer 5: Modal Content             │  Elevation: 8
│  (Buttons, Text, Icon)              │
├─────────────────────────────────────┤
│  Layer 4: White Card Background     │  Elevation: 8
│  (400x500px, borderRadius: 20)     │
├─────────────────────────────────────┤
│  Layer 3: Animated Container        │  Opacity/Scale animated
│  (Fade & Scale animations)          │
├─────────────────────────────────────┤
│  Layer 2: Backdrop Overlay          │  Opacity: 0.5
│  (Full screen, dismissable)         │
├─────────────────────────────────────┤
│  Layer 1: React Native Modal        │  Transparent background
│  (Full screen container)            │
└─────────────────────────────────────┘
```

## Positioning Breakdown

### Figma Design Coordinates (400x500 modal)
```
┌──────────────────────────────────────┐ 0
│                                      │
│              ┌───────┐               │ 50
│              │ Icon  │               │
│              │180x180│               │
│              └───────┘               │ 230
│                                      │
│       "Thank you for your order!"    │ 270
│    "Your order has been placed..."   │ 297
│                                      │
│        ┌──────────────────┐          │ 357
│        │  Track Order     │          │
│        └──────────────────┘          │ 397
│                                      │
│        ┌──────────────────┐          │ 407
│        │  Back to Home    │          │
│        └──────────────────┘          │ 447
│                                      │
└──────────────────────────────────────┘ 500
0     83    110         290     317  400
```

### Responsive Scaling Applied
- Horizontal positions: Use `s()` function (scale based on 440px width)
- Vertical positions: Use `vs()` function (verticalScale based on 956px height)
- Icon dimensions: Use `s()` for square aspect ratio
- Button heights: Use `vs()` for vertical scaling
- Font sizes: Use `s()` for consistent scaling

## Animation Flow

### Opening Animation (300ms)
```
State: visible = false → true

Timeline:
0ms    │ Modal appears
       │ Backdrop: opacity 0 → 1
       │ Content: scale 0.8, opacity 0
       │
100ms  │ Backdrop fully visible
       │ Content: scale 0.85, opacity 0.5
       │
200ms  │ Content: scale 0.95, opacity 0.8
       │
300ms  │ Content: scale 1.0, opacity 1.0
       │ Animation complete
```

### Closing Animation (200ms)
```
State: visible = true → false

Timeline:
0ms    │ Close triggered
       │ Content: scale 1.0, opacity 1.0
       │
100ms  │ Content: scale 0.9, opacity 0.5
       │ Backdrop: opacity 0.5
       │
200ms  │ Content: scale 0.8, opacity 0
       │ Backdrop: opacity 0
       │ Modal hidden
```

## Interaction States

### Modal State Machine
```
┌──────────────┐
│   Hidden     │ visible = false
└──────┬───────┘
       │
       │ visible = true
       │
┌──────▼───────┐
│  Animating   │ Fade in + Scale spring
│     In       │ Duration: 300ms
└──────┬───────┘
       │
       │ Animation complete
       │
┌──────▼───────┐
│   Visible    │ User can interact
└──────┬───────┘
       │
       │ User action (backdrop press, button press, or onClose())
       │
┌──────▼───────┐
│  Animating   │ Fade out + Scale down
│     Out      │ Duration: 200ms
└──────┬───────┘
       │
       │ Animation complete
       │
┌──────▼───────┐
│   Hidden     │ Modal removed
└──────────────┘
```

### Button Press States
```
Track Order Button:
┌─────────────┐
│   Normal    │ Background: #3BB77E, Opacity: 1.0
└─────┬───────┘
      │
      │ onPressIn
      │
┌─────▼───────┐
│   Pressed   │ Background: #3BB77E, Opacity: 0.7
└─────┬───────┘
      │
      │ onPressOut
      │
┌─────▼───────┐
│  Navigate   │ Close modal → Go to order details
└─────────────┘

Back to Home Button:
┌─────────────┐
│   Normal    │ Background: rgba(217,217,217,0.5), Opacity: 1.0
└─────┬───────┘
      │
      │ onPressIn
      │
┌─────▼───────┐
│   Pressed   │ Background: rgba(217,217,217,0.5), Opacity: 0.7
└─────┬───────┘
      │
      │ onPressOut
      │
┌─────▼───────┐
│  Navigate   │ Close modal → Go to home
└─────────────┘
```

## Style Dependencies

### Required Constants
```typescript
// Colors (from ../../constants/Colors)
- Colors.white: '#FFFFFF'
- Colors.primary: '#3BB77E'
- Colors.darkGray: '#1E1E1E'
- Colors.shadow: 'rgba(0, 0, 0, 0.25)'

// Fonts (from ../../constants/Fonts)
- Fonts.primary: 'Clash Grotesk Variable'
- Fonts.weights.normal: '400'
- Fonts.weights.medium: '500'

// Responsive (from ../../constants/responsive)
- s(): Scale function for horizontal dimensions
- vs(): VerticalScale function for vertical dimensions
```

### Shadow Specifications
```
Modal Card Shadow:
- shadowColor: rgba(0, 0, 0, 0.25)
- shadowOffset: { width: 0, height: 0 }
- shadowOpacity: 0.25
- shadowRadius: 5
- elevation: 8 (Android)

Button Shadows:
- shadowColor: rgba(0, 0, 0, 0.25)
- shadowOffset: { width: 0, height: 0 }
- shadowOpacity: 0.25
- shadowRadius: 5
- elevation: 3 (Android)
```

## Props Interface

```typescript
interface OrderCompleteModalProps {
  // Controls modal visibility
  visible: boolean;

  // Callback when modal should close
  // Triggered by: backdrop press, button navigation
  onClose: () => void;

  // Order identifier to display
  // Format: "ORD-2024-123456789" or custom format
  orderId: string;
}
```

## Event Flow

### Successful Order Placement Flow
```
1. User completes payment selection
   ↓
2. App processes payment
   ↓
3. Order saved to Firebase
   ↓
4. Generate orderId
   ↓
5. Set orderId state
   ↓
6. Set visible = true
   ↓
7. Modal animates in
   ↓
8. User sees success message
   ↓
9. User selects action:
   ├─→ "Track Order"
   │   ├─→ onClose()
   │   ├─→ Modal animates out
   │   └─→ Navigate to order details
   │
   └─→ "Back to Home"
       ├─→ onClose()
       ├─→ Modal animates out
       └─→ Navigate to home screen
```

## File Structure

```
src/components/ui/OrderCompleteModal.tsx
├── Imports
│   ├── React, useEffect, useRef
│   ├── React Native components
│   ├── expo-router (useRouter)
│   ├── Constants (Colors, Fonts, responsive)
│   └── Assets
│
├── Interface Definition
│   └── OrderCompleteModalProps
│
├── Component Function
│   ├── State & Refs
│   │   ├── fadeAnim (Animated.Value)
│   │   └── scaleAnim (Animated.Value)
│   │
│   ├── Effects
│   │   └── useEffect for animation triggers
│   │
│   ├── Event Handlers
│   │   ├── handleTrackOrder()
│   │   ├── handleBackToHome()
│   │   └── handleBackdropPress()
│   │
│   └── Render
│       └── Modal component tree
│
└── Styles
    └── StyleSheet.create()
```

## Testing Scenarios

### Visual Testing
1. Modal appears centered on all screen sizes
2. Icon loads and displays correctly
3. Text is centered and readable
4. Buttons are properly styled
5. Shadows render correctly
6. Animations are smooth

### Interaction Testing
1. Backdrop press dismisses modal
2. Track Order button navigates correctly
3. Back to Home button navigates correctly
4. Multiple rapid taps don't cause issues
5. Modal can be reopened after closing

### Edge Cases
1. Very long order IDs (text wrapping)
2. Modal shown immediately on mount
3. Rapid show/hide toggles
4. Navigation while animating
5. Memory cleanup on unmount

## Performance Considerations

- Uses `useNativeDriver: true` for smooth 60fps animations
- Image asset pre-loaded (no lazy loading needed)
- Minimal re-renders (only when props change)
- Animations cleanup on unmount
- No heavy computations in render path

## Accessibility Notes

- Modal announces when opened (React Native Modal default)
- Buttons are tappable with sufficient size (40px height)
- Text has good contrast ratios
- Backdrop provides clear visual separation
- Focus trap (can't interact with background content)
