# Customer Profile Screen - Quick Start Guide

## Installation Complete ✅

The Customer Profile Screen component has been successfully converted from Figma and is ready to use!

---

## What Was Created

### 1. Main Component
**File:** `src/components/ui/CustomerProfileScreen.tsx` (396 lines)
- Pixel-perfect React Native component
- Full TypeScript support
- Responsive scaling for all devices
- 6 default menu items included

### 2. Documentation
**File:** `src/components/ui/CustomerProfileScreen.README.md` (265 lines)
- Complete API documentation
- Props reference
- Design specifications
- Responsive behavior guide

### 3. Usage Examples
**File:** `src/components/ui/CustomerProfileScreen.example.tsx` (326 lines)
- Basic usage example
- Custom menu items example
- Firebase authentication example
- Expo Router integration example

### 4. Assets (11 files)
**Location:** `src/assets/images/customer-profile-nav/`
- All icons downloaded at 3x scale
- Background header image
- Figma data JSON

### 5. Component Export
**File:** `src/components/ui/index.ts` (updated)
- Component and types exported
- Ready to import from `@/components/ui`

---

## Quick Usage (Copy & Paste Ready)

### Step 1: Create Profile Screen File
Create: `app/(main)/(customer)/profile.tsx`

```typescript
import React from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CustomerProfileScreen, MenuItem } from '@/components/ui';

export default function CustomerProfile() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => router.replace('/(auth)/signin'),
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'my-account',
      label: 'My Account',
      icon: require('@/assets/images/customer-profile-nav/account-icon.png'),
      onPress: () => console.log('My Account pressed'),
    },
    {
      id: 'order-history',
      label: 'Order History',
      icon: require('@/assets/images/customer-profile-nav/order-history-icon.png'),
      onPress: () => router.push('/(main)/(customer)/orders'),
    },
    {
      id: 'e-wallet',
      label: 'E-Wallet Details',
      icon: require('@/assets/images/customer-profile-nav/wallet-icon.png'),
      onPress: () => console.log('E-Wallet pressed'),
    },
    {
      id: 'help-support',
      label: 'Help & Support',
      icon: require('@/assets/images/customer-profile-nav/support-icon.png'),
      onPress: () => console.log('Help pressed'),
    },
    {
      id: 'terms-privacy',
      label: 'Term & Privacy Policy',
      icon: require('@/assets/images/customer-profile-nav/privacy-icon.png'),
      onPress: () => console.log('Terms pressed'),
    },
    {
      id: 'logout',
      label: 'Log Out',
      icon: require('@/assets/images/customer-profile-nav/logout-icon.png'),
      onPress: handleLogout,
    },
  ];

  return (
    <CustomerProfileScreen
      userName="Maynard Dotarot"
      userEmail="dotarot@gmail.com"
      userInitials="DO"
      avatarColor="#3B82F6"
      onBackPress={() => router.back()}
      onNotificationPress={() => router.push('/(main)/(customer)/notifications')}
      menuItems={menuItems}
    />
  );
}
```

### Step 2: Test the Component
```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Step 3: Navigate to Profile
Add navigation from your app (e.g., from bottom tab or home screen):
```typescript
router.push('/(main)/(customer)/profile');
```

---

## Minimal Example (No Custom Menu)

The simplest way to use the component with default menu items:

```typescript
import React from 'react';
import { useRouter } from 'expo-router';
import { CustomerProfileScreen } from '@/components/ui';

export default function CustomerProfile() {
  const router = useRouter();

  return (
    <CustomerProfileScreen
      onBackPress={() => router.back()}
      onNotificationPress={() => router.push('/notifications')}
    />
  );
}
```

That's it! The component includes default menu items automatically.

---

## Customization Options

### Change Avatar Color
```typescript
<CustomerProfileScreen
  avatarColor="#10B981" // Green
  // or
  avatarColor="#EF4444" // Red
  // or
  avatarColor="#8B5CF6" // Purple
  {...otherProps}
/>
```

### Update User Information
```typescript
<CustomerProfileScreen
  userName="John Doe"
  userEmail="john.doe@example.com"
  userInitials="JD"
  {...otherProps}
/>
```

### Connect to Firebase Auth
```typescript
import { auth } from '@/FirebaseConfig';
import { useEffect, useState } from 'react';

export default function CustomerProfile() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  return (
    <CustomerProfileScreen
      userName={user?.displayName || 'User'}
      userEmail={user?.email || 'user@example.com'}
      userInitials={getInitials(user?.displayName)}
      {...otherProps}
    />
  );
}

function getInitials(name?: string | null): string {
  if (!name) return 'US';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}
```

---

## Props Reference

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `userName` | `string` | No | `'Maynard Dotarot'` | User's full name |
| `userEmail` | `string` | No | `'dotarot@gmail.com'` | User's email |
| `userInitials` | `string` | No | `'DO'` | Avatar initials |
| `avatarColor` | `string` | No | `'#3B82F6'` | Avatar background |
| `onBackPress` | `() => void` | **Yes** | - | Back button handler |
| `onNotificationPress` | `() => void` | **Yes** | - | Notification handler |
| `menuItems` | `MenuItem[]` | No | Default items | Custom menu items |

---

## Default Menu Items

If you don't provide `menuItems`, these are included automatically:

1. **My Account** - User account settings
2. **Order History** - Past orders
3. **E-Wallet Details** - Payment methods
4. **Help & Support** - Customer support
5. **Term & Privacy Policy** - Legal info
6. **Log Out** - Sign out

---

## File Locations

All files are ready to use:

```
TindaGo/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── CustomerProfileScreen.tsx          ✅ Main component
│   │       ├── CustomerProfileScreen.README.md    ✅ Documentation
│   │       ├── CustomerProfileScreen.example.tsx  ✅ Examples
│   │       └── index.ts                          ✅ Exports
│   └── assets/
│       └── images/
│           └── customer-profile-nav/             ✅ All icons (11 files)
└── CUSTOMER_PROFILE_CONVERSION_SUMMARY.md        ✅ Full summary
```

---

## Testing Checklist

Before deploying:
- [ ] Component displays correctly on screen
- [ ] All icons are visible
- [ ] Back button navigates correctly
- [ ] Notification button works
- [ ] All menu items are clickable
- [ ] Scroll works smoothly
- [ ] Layout matches Figma design
- [ ] Works on different screen sizes
- [ ] No console errors or warnings

---

## Need Help?

### View Full Documentation
```bash
# Open in VS Code
code src/components/ui/CustomerProfileScreen.README.md
```

### View Examples
```bash
# Open in VS Code
code src/components/ui/CustomerProfileScreen.example.tsx
```

### View Component Code
```bash
# Open in VS Code
code src/components/ui/CustomerProfileScreen.tsx
```

### Check Figma Design
Original design: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=759-4154

---

## Next Steps

1. ✅ Component is installed and ready
2. Create a profile screen route in your app
3. Add navigation to the profile screen
4. Customize menu items for your needs
5. Connect to Firebase authentication
6. Test on real devices
7. Deploy to production

---

## Component Features

### What's Included
- ✅ Pixel-perfect Figma conversion
- ✅ Fully responsive (works on all screen sizes)
- ✅ TypeScript with full type safety
- ✅ Customizable props
- ✅ Default menu items
- ✅ Shadow effects
- ✅ Smooth scrolling
- ✅ Platform-optimized (iOS & Android)
- ✅ Production-ready code
- ✅ Comprehensive documentation

### Design Details
- **Baseline:** 440x956 (Figma design)
- **Responsive:** Scales to any device size
- **Typography:** Clash Grotesk Variable (Figma specs)
- **Colors:** TindaGo color palette
- **Icons:** High-resolution (3x) PNG assets
- **Layout:** ScrollView for long content

---

## Success!

Your Customer Profile Screen is ready to use. Just create a screen file and start customizing!

**Component Location:** `src/components/ui/CustomerProfileScreen.tsx`
**Import:** `import { CustomerProfileScreen } from '@/components/ui';`

Happy coding! 🚀
