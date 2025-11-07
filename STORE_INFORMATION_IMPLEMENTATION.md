# Store Information Screen - Implementation Guide

## Overview
Complete implementation of the Store Information screen for the TindaGo mobile app, converted from Figma design (node-id: 1196-6316).

## File Created
- **Location**: `src/screens/StoreInformationScreen.tsx`
- **Type**: React Native TypeScript Component
- **Lines**: 540 lines of fully functional code

## Features Implemented

### 1. **Header Section**
- Back button (left)
- "Store Information" title (center)
- Favorite/Heart button (right) - toggleable
- Clean white background with bottom border

### 2. **Store Image Banner**
- Full-width hero image (200px height)
- Image loads from URI
- Responsive cover mode
- Placeholder background while loading

### 3. **Store Basic Information**
- **Store Name** - Large, bold heading (24px)
- **Category Badge** - Green pill badge showing store category
- **Rating Display** - Star rating system (0-5 stars)
  - Full stars, half stars, and empty stars
  - Yellow star color (#FFB800)
  - Review count display

### 4. **About Section**
- Information icon with green accent
- Section title "About"
- Multi-line description text
- Proper line height for readability

### 5. **Contact Information Section**
- **Phone Number**
  - Tap to call functionality
  - Green circular icon background
  - Formatted display
  - Chevron indicator
  
- **Email Address**
  - Tap to open email client
  - Green circular icon background
  - Formatted display
  - Chevron indicator

### 6. **Operating Hours Section**
- Time icon with green accent
- Day-by-day schedule listing
- Monday through Sunday
- Special "Closed" status in red color
- Clean table-like layout

### 7. **Location Section**
- Location pin icon with green accent
- Street address display
- City/Region display
- Interactive map placeholder
  - Tap to open in Maps app
  - iOS and Android support
  - Shows map icon and instruction text

### 8. **Action Buttons (Fixed Bottom Bar)**
- **Call Button** - Instant call functionality
- **Message Button** - Opens SMS app
- **Directions Button** - Opens navigation app
- White text on green background (#3BB77E)
- Proper spacing and alignment
- Shadow/elevation for depth
- Fixed positioning at screen bottom

## Technical Specifications

### Colors
```typescript
Primary Green: #3BB77E
Background: #F5F5F5
Card Background: #FFFFFF
Text Primary: #1E1E1E
Text Secondary: #666666
Text Tertiary: #999999
Border: #E5E5E5
Star Yellow: #FFB800
Error/Closed: #FF4444
Light Green BG: #F0F9F4
```

### Typography
```typescript
Store Name: 24px, Bold
Section Titles: 18px, SemiBold
Contact Values: 14px, Medium
Body Text: 14px, Regular
Labels: 12px, Regular
Action Buttons: 14px, SemiBold
```

### Spacing
```typescript
Section Padding: 16px
Section Gap: 8px
Icon Size: 20-24px
Icon Container: 40x40px
Border Radius: 8-12px
Image Height: 200px
Map Height: 150px
```

## Props Interface

```typescript
interface StoreInfoProps {
  storeId?: string;
  storeName?: string;
  storeImage?: string;
  description?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  phoneNumber?: string;
  email?: string;
  address?: string;
  city?: string;
  operatingHours?: {
    [key: string]: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
```

## Usage Example

```typescript
import StoreInformationScreen from './src/screens/StoreInformationScreen';

// In your navigation or app
<StoreInformationScreen
  storeName="Juan's Sari-Sari Store"
  storeImage="https://example.com/store-image.jpg"
  description="Your friendly neighborhood store offering quality goods."
  category="Grocery"
  rating={4.8}
  reviewCount={156}
  phoneNumber="+63 912 345 6789"
  email="juan@tindago.com"
  address="123 Main Street, Barangay Sample"
  city="Davao City, Philippines"
  operatingHours={{
    Monday: '7:00 AM - 8:00 PM',
    Tuesday: '7:00 AM - 8:00 PM',
    Wednesday: '7:00 AM - 8:00 PM',
    Thursday: '7:00 AM - 8:00 PM',
    Friday: '7:00 AM - 9:00 PM',
    Saturday: '8:00 AM - 9:00 PM',
    Sunday: 'Closed',
  }}
  coordinates={{
    latitude: 7.0731,
    longitude: 125.6128,
  }}
/>
```

## Interactive Features

### 1. Call Functionality
```typescript
const handleCall = () => {
  const phoneUrl = `tel:${phoneNumber}`;
  Linking.canOpenURL(phoneUrl).then((supported) => {
    if (supported) {
      Linking.openURL(phoneUrl);
    }
  });
};
```

### 2. Message/SMS Functionality
```typescript
const handleMessage = () => {
  const smsUrl = `sms:${phoneNumber}`;
  Linking.canOpenURL(smsUrl).then((supported) => {
    if (supported) {
      Linking.openURL(smsUrl);
    }
  });
};
```

### 3. Directions/Maps Functionality
```typescript
const handleDirections = () => {
  const scheme = Platform.select({
    ios: 'maps:',
    android: 'geo:',
  });
  const url = Platform.select({
    ios: `${scheme}?q=${coordinates.latitude},${coordinates.longitude}`,
    android: `${scheme}${coordinates.latitude},${coordinates.longitude}`,
  });
  
  if (url) {
    Linking.openURL(url);
  }
};
```

### 4. Email Functionality
```typescript
const handleEmail = () => {
  const emailUrl = `mailto:${email}`;
  Linking.canOpenURL(emailUrl).then((supported) => {
    if (supported) {
      Linking.openURL(emailUrl);
    }
  });
};
```

### 5. Favorite Toggle
```typescript
const [isFavorite, setIsFavorite] = useState(false);
// Toggles between filled and outline heart icon
```

## Dependencies Required

```json
{
  "react": "^18.x",
  "react-native": "^0.72.x",
  "@expo/vector-icons": "^13.x"
}
```

## Icon Libraries Used
- **Ionicons** - Primary icons (back, heart, phone, email, etc.)
- **MaterialIcons** - Optional alternative icons
- **FontAwesome5** - Optional additional icons

## Platform Support
- ✅ iOS
- ✅ Android
- ✅ Responsive design
- ✅ Safe area handling
- ✅ Platform-specific linking (Maps, SMS, Phone)

## Testing Checklist

### Visual Testing
- [ ] Header displays correctly with all buttons
- [ ] Store image loads and displays properly
- [ ] Store name, category badge, and rating aligned
- [ ] All sections have proper spacing
- [ ] Icons display correctly with green color
- [ ] Operating hours table formatted properly
- [ ] Action buttons fixed at bottom
- [ ] ScrollView scrolls smoothly

### Functional Testing
- [ ] Back button navigates back
- [ ] Heart/Favorite button toggles state
- [ ] Call button opens phone dialer
- [ ] Message button opens SMS app
- [ ] Email tap opens email client
- [ ] Directions button opens maps app
- [ ] Map placeholder is tappable
- [ ] Star rating renders correctly for different values

### Responsive Testing
- [ ] Works on small screens (iPhone SE)
- [ ] Works on large screens (iPad)
- [ ] Works on Android devices
- [ ] Safe area insets work properly
- [ ] Bottom buttons don't overlap content

## Future Enhancements

1. **Real Map Integration**
   - Integrate Google Maps or Apple Maps view
   - Show store location marker
   - Enable zoom and pan

2. **Image Gallery**
   - Multiple store images
   - Swipeable gallery
   - Image viewer modal

3. **Reviews Section**
   - Display customer reviews
   - Rating breakdown
   - Review submission

4. **Products Preview**
   - Featured products from store
   - Quick add to cart
   - Product categories

5. **Share Functionality**
   - Share store details
   - Social media integration
   - Deep linking support

6. **Favorites Persistence**
   - Save favorite state to backend
   - Sync across devices
   - Favorites list page

## Customization

### Change Colors
Edit the colors in the StyleSheet:
```typescript
const styles = StyleSheet.create({
  // Change primary green
  categoryBadge: {
    backgroundColor: '#YOUR_COLOR', // Change from #3BB77E
  },
  // Change section icon colors
  sectionHeader: {
    // Icon color in component: color="#YOUR_COLOR"
  },
});
```

### Adjust Spacing
Modify padding and margin values:
```typescript
section: {
  padding: 20, // Change from 16
  marginTop: 12, // Change from 8
},
```

### Change Font Sizes
Update fontSize in styles:
```typescript
storeName: {
  fontSize: 28, // Change from 24
},
```

## Integration with Navigation

### React Navigation Example
```typescript
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

<Stack.Navigator>
  <Stack.Screen 
    name="StoreInfo" 
    component={StoreInformationScreen}
    options={{ headerShown: false }}
  />
</Stack.Navigator>
```

### Pass Data via Navigation
```typescript
navigation.navigate('StoreInfo', {
  storeName: 'Juan Store',
  storeImage: imageUrl,
  // ... other props
});
```

## Notes
- All icons use Ionicons from @expo/vector-icons
- Component uses TypeScript for type safety
- Fully responsive with SafeAreaView
- Handles platform differences (iOS/Android)
- Ready for production use
- Follows TindaGo design system (#3BB77E green)

## Support
For issues or questions about this implementation, refer to:
- React Native Documentation
- Expo Documentation
- TindaGo Design System Guidelines
