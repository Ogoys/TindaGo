# Customer Profile Screen Component

## Overview
Pixel-perfect conversion from Figma design to React Native component for the TindaGo customer profile screen.

**Figma Source:** https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=759-4154

## Design Specifications

### Layout
- **Frame Size:** 440x990px (Figma)
- **Baseline Scaling:** 440x956 (guidelineBaseWidth x guidelineBaseHeight)
- **Background:** #F4F6F6 (backgroundGray)
- **Header Background:** #EBFBEA (light green) - 440x384px

### Typography
- **Profile Title:** Clash Grotesk Variable, 20px, Semi-Bold (600), Dark Gray
- **User Name:** Clash Grotesk Variable, 24px, Medium (500), Dark Gray
- **User Email:** Clash Grotesk Variable, 16px, Medium (500), Dark Gray 50% opacity
- **Menu Labels:** Clash Grotesk Variable, 18px, Medium (500), Dark Gray

### Components
1. **Top Navigation Bar** (y: 74-114)
   - Back button: 30x30px, white circle with shadow
   - Profile title: Centered text
   - Notification button: 40x40px, white circle with shadow

2. **Profile Avatar** (x: 160, y: 155, size: 120x120)
   - Blue circle (#3B82F6)
   - White initials text (48px)
   - Center-aligned

3. **Menu Items** (Starting at y: 405)
   - White cards: 400x75px, 16px border radius
   - Icon circle: 50x50px with 1px border, contains 30x30px icon
   - Label: 18px, positioned 65px from icon
   - Forward arrow: 30x30px, right-aligned
   - Vertical spacing: 20px between cards

## Assets
All assets are located in: `src/assets/images/customer-profile-nav/`

### Downloaded Assets:
- `account-icon.png` - My Account icon
- `background-header.png` - Header background image
- `chevron-left.png` - Back button icon
- `forward-arrow.png` - Right arrow for menu items
- `logout-icon.png` - Logout icon
- `notification-icon.png` - Notification bell icon
- `order-history-icon.png` - Order history icon
- `privacy-icon.png` - Privacy policy icon
- `support-icon.png` - Help & Support icon
- `wallet-icon.png` - E-Wallet icon

## Usage

### Basic Usage
```typescript
import { CustomerProfileScreen } from '@/components/ui';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <CustomerProfileScreen
      userName="Maynard Dotarot"
      userEmail="dotarot@gmail.com"
      userInitials="DO"
      avatarColor="#3B82F6"
      onBackPress={() => router.back()}
      onNotificationPress={() => router.push('/notifications')}
    />
  );
}
```

### Custom Menu Items
```typescript
import { CustomerProfileScreen, MenuItem } from '@/components/ui';

const customMenuItems: MenuItem[] = [
  {
    id: 'my-account',
    label: 'My Account',
    icon: require('../../assets/images/customer-profile-nav/account-icon.png'),
    onPress: () => router.push('/account'),
  },
  {
    id: 'order-history',
    label: 'Order History',
    icon: require('../../assets/images/customer-profile-nav/order-history-icon.png'),
    onPress: () => router.push('/orders'),
  },
  // ... more items
];

<CustomerProfileScreen
  userName="John Doe"
  userEmail="john@example.com"
  userInitials="JD"
  onBackPress={() => router.back()}
  onNotificationPress={() => router.push('/notifications')}
  menuItems={customMenuItems}
/>
```

### With Authentication
```typescript
import { CustomerProfileScreen } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/signin');
  };

  const menuItems = [
    // ... other menu items
    {
      id: 'logout',
      label: 'Log Out',
      icon: require('../../assets/images/customer-profile-nav/logout-icon.png'),
      onPress: handleLogout,
    },
  ];

  return (
    <CustomerProfileScreen
      userName={user?.displayName || 'User'}
      userEmail={user?.email || 'user@example.com'}
      userInitials={getInitials(user?.displayName)}
      onBackPress={() => router.back()}
      onNotificationPress={() => router.push('/notifications')}
      menuItems={menuItems}
    />
  );
}
```

## Props

### CustomerProfileScreenProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `userName` | `string` | No | `'Maynard Dotarot'` | User's full name displayed below avatar |
| `userEmail` | `string` | No | `'dotarot@gmail.com'` | User's email address |
| `userInitials` | `string` | No | `'DO'` | User's initials shown in avatar |
| `avatarColor` | `string` | No | `'#3B82F6'` | Background color of avatar circle |
| `onBackPress` | `() => void` | Yes | - | Handler for back button press |
| `onNotificationPress` | `() => void` | Yes | - | Handler for notification button press |
| `menuItems` | `MenuItem[]` | No | Default items | Array of menu items to display |

### MenuItem Interface

```typescript
interface MenuItem {
  id: string;          // Unique identifier
  label: string;       // Display text
  icon: any;           // Image source (require())
  onPress: () => void; // Click handler
}
```

## Default Menu Items

The component includes 6 default menu items:
1. **My Account** - User account settings
2. **Order History** - Past orders and tracking
3. **E-Wallet Details** - Payment method management
4. **Help & Support** - Customer support access
5. **Term & Privacy Policy** - Legal information
6. **Log Out** - Sign out functionality

## Responsive Behavior

The component uses the TindaGo responsive scaling system:
- **s()** - Horizontal scaling based on screen width
- **vs()** - Vertical scaling based on screen height
- **ms()** - Moderate scaling for text (50% factor)

All measurements are scaled from the Figma baseline (440x956) to ensure pixel-perfect rendering across different screen sizes.

## Styling Customization

The component uses inline styles with exact Figma coordinates. To customize:

1. **Avatar Color:** Pass `avatarColor` prop
2. **Menu Items:** Provide custom `menuItems` array
3. **Spacing:** Adjust margin values in component styles
4. **Colors:** Modify Colors constants in `src/constants/Colors.ts`

## Accessibility

- TouchableOpacity with `activeOpacity={0.7}` for visual feedback
- ScrollView with `bounces={false}` for controlled scrolling
- Proper image `resizeMode` for icon clarity
- Shadow effects for depth perception

## Performance Considerations

- Uses `ScrollView` for long content lists
- `showsVerticalScrollIndicator={false}` for cleaner UI
- Image assets are optimized PNG files (3x scale)
- Efficient layout with absolute positioning for header

## Integration with Expo Router

```typescript
// app/(main)/(customer)/profile.tsx
import { CustomerProfileScreen } from '@/components/ui';
import { useRouter } from 'expo-router';

export default function CustomerProfile() {
  const router = useRouter();

  return (
    <CustomerProfileScreen
      onBackPress={() => router.back()}
      onNotificationPress={() => router.push('/(main)/(customer)/notifications')}
    />
  );
}
```

## Testing

Test the component with:
```bash
npm start
# Then press 'a' for Android or 'i' for iOS
```

Verify:
- [ ] All icons display correctly
- [ ] Scroll behavior is smooth
- [ ] Back and notification buttons respond
- [ ] Menu items trigger correct actions
- [ ] Layout matches Figma design exactly
- [ ] Responsive on different screen sizes

## Figma Coordinate Reference

Key positions (from Figma baseline 440x956):
- Top bar: y:74, height:40
- Back button: x:20, y:79, size:30x30
- Notification: x:375, y:74, size:40x40
- Avatar: x:160, y:155, size:120x120
- User name: y:295
- User email: y:325
- First menu item: y:405
- Menu spacing: 95px vertical (75px height + 20px gap)

## Notes

- Component is fully typed with TypeScript
- Uses relative imports (no @/ aliases in require statements)
- All assets are pre-downloaded and verified
- Follows TindaGo design system conventions
- Shadow effects use platform-specific elevation
