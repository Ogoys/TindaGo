# Future Enhancements for TindaGo

This document contains planned enhancements and improvements for future implementation.

---

## 🎨 Enhancement 1: "Store Closed" Badge in Cart (Before Auto-Removal)

### **What It Does**:
Instead of immediately removing items, show a visual warning badge for 5-10 seconds before removal.

### **Visual Example**:
```
┌──────────────────────────────────────┐
│  [IMG] Apple             [+] 2 [-]  │
│        from Kelly's      [Delete]   │
│        ₱50 each                      │
│        ₱100 total                    │
│  ⚠️ STORE CLOSED - Removing soon... │  ← NEW Badge
└──────────────────────────────────────┘
```

### **Implementation**:

**File**: `app/(main)/(customer)/cart.tsx`

**Step 1**: Add badge state
```typescript
// Add after line 44
const [closedStoreItems, setClosedStoreItems] = useState<Set<string>>(new Set());
```

**Step 2**: Modify store closure detection (replace lines 87-97):
```typescript
// Check if store is closed
if (product.storeIsOpen === false) {
  console.log(`Store for ${item.productName} is now closed, marking for removal...`);

  // Add to closed items set (shows badge)
  setClosedStoreItems(prev => new Set(prev).add(item.productId));

  // Wait 5 seconds before removing
  setTimeout(async () => {
    await removeFromCart(user.id, item.productId);

    // Show toast notification
    setToastMessage(`${item.storeName} is now closed. ${item.productName} removed from cart.`);
    setToastType('info');
    setShowToast(true);

    // Remove from closed items set
    setClosedStoreItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(item.productId);
      return newSet;
    });
  }, 5000); // 5 second delay

  return;
}
```

**Step 3**: Add badge UI (inside the cart item, after line 278):
```typescript
{/* Store Closed Warning Badge */}
{closedStoreItems.has(item.productId) && (
  <View style={styles.storeClosedBadge}>
    <Text style={styles.storeClosedText}>⚠️ STORE CLOSED - Removing soon...</Text>
  </View>
)}
```

**Step 4**: Add styles (after line 502):
```typescript
storeClosedBadge: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: '#FF6B6B',
  paddingVertical: vs(5),
  paddingHorizontal: s(10),
  borderBottomLeftRadius: s(20),
  borderBottomRightRadius: s(20),
  alignItems: 'center',
},
storeClosedText: {
  fontSize: ms(12),
  fontWeight: '600',
  color: Colors.white,
  textAlign: 'center',
},
```

**Benefit**: Gives customer 5 seconds to see what's being removed before it disappears.

**Complexity**: Easy
**Implementation Time**: ~30 minutes
**User Benefit**: Medium

---

## ⏰ Enhancement 2: Store Hours Feature (Auto Open/Close)

### **What It Does**:
Store owners can set operating hours. Store automatically opens/closes based on schedule.

### **Visual Example** (Store Owner Dashboard):
```
┌─────────────────────────────────┐
│  Store Hours                    │
│                                 │
│  Monday    [9:00 AM - 8:00 PM] │
│  Tuesday   [9:00 AM - 8:00 PM] │
│  Wednesday [9:00 AM - 8:00 PM] │
│  Thursday  [9:00 AM - 8:00 PM] │
│  Friday    [9:00 AM - 8:00 PM] │
│  Saturday  [10:00 AM - 6:00 PM]│
│  Sunday    [CLOSED]             │
│                                 │
│  [✓] Enable Auto Open/Close     │
└─────────────────────────────────┘
```

### **Implementation**:

**Step 1**: Update Store Model
**File**: `src/models/Store.ts`
```typescript
export interface Store {
  // ... existing fields
  isOpen?: boolean;
  storeHours?: {
    enabled: boolean; // Enable auto open/close
    schedule: {
      monday: { open: string; close: string; closed: boolean };
      tuesday: { open: string; close: string; closed: boolean };
      wednesday: { open: string; close: string; closed: boolean };
      thursday: { open: string; close: string; closed: boolean };
      friday: { open: string; close: string; closed: boolean };
      saturday: { open: string; close: string; closed: boolean };
      sunday: { open: string; close: string; closed: boolean };
    };
  };
}
```

**Step 2**: Create Store Hours Settings Screen
**File**: `app/(main)/(store-owner)/profile/store-hours.tsx` (NEW FILE)
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, database } from '@/lib/firebase';
import { ref, update, get } from 'firebase/database';
import { Colors } from '@/constants/Colors';
import { s, vs, ms } from '@/constants/responsive';

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export default function StoreHoursScreen() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState({
    monday: { open: '09:00', close: '20:00', closed: false },
    tuesday: { open: '09:00', close: '20:00', closed: false },
    wednesday: { open: '09:00', close: '20:00', closed: false },
    thursday: { open: '09:00', close: '20:00', closed: false },
    friday: { open: '09:00', close: '20:00', closed: false },
    saturday: { open: '10:00', close: '18:00', closed: false },
    sunday: { open: '10:00', close: '18:00', closed: true },
  });

  useEffect(() => {
    loadStoreHours();
  }, []);

  const loadStoreHours = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const storeRef = ref(database, `stores/${user.uid}/storeHours`);
      const snapshot = await get(storeRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        setEnabled(data.enabled || false);
        setSchedule(data.schedule || schedule);
      }
    } catch (error) {
      console.error('Error loading store hours:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveHours = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const storeRef = ref(database, `stores/${user.uid}/storeHours`);
      await update(storeRef, {
        enabled,
        schedule,
        updatedAt: new Date().toISOString(),
      });

      Alert.alert('Success', 'Store hours saved successfully!');
    } catch (error) {
      console.error('Error saving store hours:', error);
      Alert.alert('Error', 'Failed to save store hours. Please try again.');
    }
  };

  const toggleDay = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed: !prev[day].closed,
      },
    }));
  };

  const updateTime = (day: string, field: 'open' | 'close', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Store Hours</Text>

        {/* Enable Auto Open/Close */}
        <View style={styles.enableSection}>
          <Text style={styles.enableLabel}>Enable Auto Open/Close</Text>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ false: '#E5E7EB', true: Colors.primary }}
            thumbColor={enabled ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>

        {/* Days Schedule */}
        {DAYS.map(({ key, label }) => (
          <View key={key} style={styles.dayRow}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>{label}</Text>
              <Switch
                value={!schedule[key].closed}
                onValueChange={() => toggleDay(key)}
                trackColor={{ false: '#E5E7EB', true: Colors.primary }}
              />
            </View>

            {!schedule[key].closed && (
              <View style={styles.timeRow}>
                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Open:</Text>
                  <Text style={styles.timeValue}>{schedule[key].open}</Text>
                  {/* Add time picker component here */}
                </View>

                <View style={styles.timeInput}>
                  <Text style={styles.timeLabel}>Close:</Text>
                  <Text style={styles.timeValue}>{schedule[key].close}</Text>
                  {/* Add time picker component here */}
                </View>
              </View>
            )}
          </View>
        ))}

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={saveHours}>
          <Text style={styles.saveButtonText}>Save Hours</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: ms(24),
    fontWeight: '600',
    color: Colors.black,
    marginHorizontal: s(20),
    marginVertical: vs(20),
  },
  enableSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: s(20),
    marginHorizontal: s(20),
    marginBottom: vs(20),
    borderRadius: s(16),
  },
  enableLabel: {
    fontSize: ms(16),
    fontWeight: '500',
    color: Colors.black,
  },
  dayRow: {
    backgroundColor: Colors.white,
    padding: s(20),
    marginHorizontal: s(20),
    marginBottom: vs(15),
    borderRadius: s(16),
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: ms(16),
    fontWeight: '600',
    color: Colors.black,
  },
  timeRow: {
    flexDirection: 'row',
    marginTop: vs(15),
    gap: s(10),
  },
  timeInput: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
    padding: s(15),
    borderRadius: s(12),
  },
  timeLabel: {
    fontSize: ms(12),
    color: Colors.textSecondary,
    marginBottom: vs(5),
  },
  timeValue: {
    fontSize: ms(16),
    fontWeight: '600',
    color: Colors.black,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: vs(15),
    marginHorizontal: s(20),
    marginVertical: vs(30),
    borderRadius: s(12),
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: Colors.white,
  },
});
```

**Step 3**: Create Auto Open/Close Service
**File**: `src/services/StoreHoursService.ts` (NEW FILE)
```typescript
import { ref, update, get } from 'firebase/database';
import { database } from '../../FirebaseConfig';

export class StoreHoursService {
  /**
   * Check current time against store hours and update store status
   */
  static async checkAndUpdateStoreStatus(storeId: string) {
    try {
      const storeRef = ref(database, `stores/${storeId}`);
      const snapshot = await get(storeRef);

      if (!snapshot.exists()) return;

      const store = snapshot.val();
      const storeHours = store.storeHours;

      if (!storeHours?.enabled) return; // Auto hours not enabled

      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' }) as
        'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const daySchedule = storeHours.schedule[currentDay];

      if (daySchedule.closed) {
        // Closed all day
        if (store.isOpen !== false) {
          await this.toggleStore(storeId, false);
          console.log(`🔴 Auto-closed ${store.storeName} (closed all day)`);
        }
        return;
      }

      const shouldBeOpen = currentTime >= daySchedule.open && currentTime < daySchedule.close;

      if (shouldBeOpen && store.isOpen === false) {
        // Should be open but is closed - open it
        await this.toggleStore(storeId, true);
        console.log(`🟢 Auto-opened ${store.storeName}`);
      } else if (!shouldBeOpen && store.isOpen !== false) {
        // Should be closed but is open - close it
        await this.toggleStore(storeId, false);
        console.log(`🔴 Auto-closed ${store.storeName}`);
      }
    } catch (error) {
      console.error('Error checking store hours:', error);
    }
  }

  /**
   * Toggle store open/close status and update all products
   */
  static async toggleStore(storeId: string, isOpen: boolean) {
    const storeRef = ref(database, `stores/${storeId}`);
    await update(storeRef, {
      isOpen,
      lastAutoUpdate: new Date().toISOString(),
    });

    // Update all products
    const productsRef = ref(database, 'products');
    const snapshot = await get(productsRef);

    if (snapshot.exists()) {
      const products = snapshot.val();
      const updates: Record<string, any> = {};

      Object.keys(products).forEach(productId => {
        if (products[productId].storeOwnerId === storeId) {
          updates[`products/${productId}/storeIsOpen`] = isOpen;
        }
      });

      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
        console.log(`📦 Updated ${Object.keys(updates).length} products for store ${storeId}`);
      }
    }
  }

  /**
   * Get next opening time for a store
   */
  static getNextOpeningTime(storeHours: any): string {
    if (!storeHours?.enabled) return 'Opening hours not set';

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' }) as
      'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const days: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'> =
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const todayIndex = days.indexOf(currentDay);

    // Check today
    const todaySchedule = storeHours.schedule[currentDay];
    if (!todaySchedule.closed && currentTime < todaySchedule.open) {
      return `Opens today at ${this.formatTime(todaySchedule.open)}`;
    }

    // Check next 7 days
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (todayIndex + i) % 7;
      const nextDay = days[nextDayIndex];
      const nextSchedule = storeHours.schedule[nextDay];

      if (!nextSchedule.closed) {
        const dayName = i === 1 ? 'tomorrow' : this.capitalizeFirst(nextDay);
        return `Opens ${dayName} at ${this.formatTime(nextSchedule.open)}`;
      }
    }

    return 'Opening hours not available';
  }

  /**
   * Format time from 24-hour to 12-hour format
   */
  static formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  /**
   * Capitalize first letter
   */
  static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
```

**Step 4**: Add Background Scheduler
**File**: `app/(main)/(store-owner)/home.tsx`

Add import:
```typescript
import { StoreHoursService } from '@/services/StoreHoursService';
```

Add this useEffect after existing useEffects:
```typescript
// Auto open/close based on store hours
useEffect(() => {
  // Check store hours every minute
  const interval = setInterval(async () => {
    const user = auth.currentUser;
    if (user) {
      await StoreHoursService.checkAndUpdateStoreStatus(user.uid);
    }
  }, 60000); // Check every 1 minute

  // Check immediately on mount
  const user = auth.currentUser;
  if (user) {
    StoreHoursService.checkAndUpdateStoreStatus(user.uid);
  }

  return () => clearInterval(interval);
}, []);
```

**Step 5**: Add Navigation Link
In store owner profile menu, add:
```typescript
<TouchableOpacity onPress={() => router.push('/(main)/(store-owner)/profile/store-hours')}>
  <Text>Store Hours Settings</Text>
</TouchableOpacity>
```

**Benefit**: Store automatically opens/closes based on schedule. No manual toggle needed!

**Complexity**: Hard
**Implementation Time**: ~3-4 hours
**User Benefit**: High

---

## 🔔 Enhancement 3: Notification Count for Closed Store Items

### **What It Does**:
Shows a badge count on cart icon when items are removed due to store closure.

### **Visual Example**:
```
Home Screen:
┌──────────────────┐
│  🛒 Cart  [🔴3]  │  ← Badge shows 3 items removed
└──────────────────┘
```

### **Implementation**:

**File**: `app/(main)/(customer)/home.tsx`

**Step 1**: Add state for removed items count
```typescript
// Add near other state declarations (around line 85)
const [removedItemsCount, setRemovedItemsCount] = useState(0);
```

**Step 2**: Listen for cart removals
```typescript
// Add this useEffect
useEffect(() => {
  if (!user) return;

  // Listen for special "removedCount" field in Firebase
  const removedRef = ref(database, `carts/${user.id}/removedCount`);
  const unsubscribe = onValue(removedRef, (snapshot) => {
    if (snapshot.exists()) {
      setRemovedItemsCount(snapshot.val());
    } else {
      setRemovedItemsCount(0);
    }
  });

  return () => unsubscribe();
}, [user]);
```

**Step 3**: Update cart removal to increment counter
**File**: `app/(main)/(customer)/cart.tsx`

In store closure detection (around line 90), add:
```typescript
// After removing from cart, increment removed count
const removedCountRef = ref(database, `carts/${user.id}/removedCount`);
const countSnapshot = await get(removedCountRef);
const currentCount = countSnapshot.exists() ? countSnapshot.val() : 0;
await update(removedCountRef, currentCount + 1);
```

**Step 4**: Show badge on cart icon
**File**: `app/(main)/(customer)/home.tsx`

Find the cart icon in bottom navigation and add:
```typescript
<TouchableOpacity onPress={() => router.push('/(main)/(customer)/cart')}>
  <Image source={cartIcon} style={styles.navIcon} />

  {/* Removed items badge */}
  {removedItemsCount > 0 && (
    <View style={styles.removedBadge}>
      <Text style={styles.removedBadgeText}>{removedItemsCount}</Text>
    </View>
  )}

  {/* Regular cart count badge */}
  {cartCount > 0 && (
    <View style={styles.cartBadge}>
      <Text style={styles.cartBadgeText}>{cartCount}</Text>
    </View>
  )}
</TouchableOpacity>
```

**Step 5**: Add styles
```typescript
removedBadge: {
  position: 'absolute',
  top: -5,
  right: -5,
  backgroundColor: '#FF6B6B',
  borderRadius: s(10),
  minWidth: s(18),
  height: vs(18),
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: s(5),
  borderWidth: 2,
  borderColor: Colors.white,
},
removedBadgeText: {
  fontSize: ms(10),
  fontWeight: '600',
  color: Colors.white,
},
```

**Step 6**: Clear count when user opens cart
**File**: `app/(main)/(customer)/cart.tsx`

Add useEffect:
```typescript
useEffect(() => {
  // Clear removed count when cart is opened
  if (user) {
    const removedCountRef = ref(database, `carts/${user.id}/removedCount`);
    update(removedCountRef, 0);
  }
}, [user]);
```

**Benefit**: Customer immediately sees how many items were removed from cart.

**Complexity**: Medium
**Implementation Time**: ~1 hour
**User Benefit**: Low

---

## 🕐 Enhancement 4: "Store Reopens At..." Message

### **What It Does**:
Shows when a closed store will reopen (if store hours are set).

### **Visual Example**:
```
Product Details:
┌─────────────────────────────┐
│ Fresh Apple                 │
│ from Kelly's Store          │
│ 🔴 Store Closed             │
│ Opens tomorrow at 9:00 AM   │  ← NEW Message
└─────────────────────────────┘
```

### **Implementation**:

**File**: `app/(main)/shared/product-details.tsx`

**Step 1**: Import StoreHoursService
```typescript
import { StoreHoursService } from '@/services/StoreHoursService';
```

**Step 2**: Add state for reopen message
```typescript
const [reopenMessage, setReopenMessage] = useState<string>('');
```

**Step 3**: Calculate next opening time when store data loads
```typescript
// Add to existing store loading useEffect (around line 130)
useEffect(() => {
  // ... existing store loading code

  if (storeData && storeData.isOpen === false && storeData.storeHours?.enabled) {
    const message = StoreHoursService.getNextOpeningTime(storeData.storeHours);
    setReopenMessage(message);
  } else {
    setReopenMessage('');
  }
}, [store]);
```

**Step 4**: Display in product details UI
```typescript
{product.storeName && (
  <>
    <Text style={styles.storeNameLabel}>from {product.storeName}</Text>
    {product.storeIsOpen === false && (
      <View style={styles.storeClosedContainer}>
        <Text style={styles.storeClosedLabel}>🔴 Store Closed</Text>
        {reopenMessage && (
          <Text style={styles.reopenTimeLabel}>{reopenMessage}</Text>
        )}
      </View>
    )}
  </>
)}
```

**Step 5**: Add styles
```typescript
storeClosedContainer: {
  marginBottom: vs(4),
},
storeClosedLabel: {
  fontSize: ms(13),
  fontWeight: '600',
  color: '#FF6B6B',
  lineHeight: vs(18),
  marginBottom: vs(2),
},
reopenTimeLabel: {
  fontSize: ms(11),
  fontWeight: '500',
  color: '#FF8D2F',
  lineHeight: vs(16),
  fontStyle: 'italic',
},
```

**Benefit**: Customers know when they can order again. Reduces frustration!

**Complexity**: Medium
**Implementation Time**: ~1 hour
**User Benefit**: High

---

## 📋 Summary of Enhancements:

| Enhancement | Complexity | User Benefit | Implementation Time |
|-------------|-----------|--------------|---------------------|
| **1. Store Closed Badge** | Easy | Medium | ~30 minutes |
| **2. Store Hours System** | Hard | High | ~3-4 hours |
| **3. Notification Count** | Medium | Low | ~1 hour |
| **4. Reopen Time Message** | Medium | High | ~1 hour |

---

## 🎯 Implementation Recommendations:

### **Quick Wins** (High value, low effort):
- ✅ **Enhancement 1** (Store Closed Badge) - Quick to implement, nice UX
- ✅ **Enhancement 4** (Reopen Message) - Very useful for customers

### **Complete System** (Most valuable):
- ✅ **Enhancement 2** (Store Hours) - Most valuable, but takes longest
- ✅ Then add **Enhancement 4** to show reopen times

### **Optional** (Nice to have):
- ⏭️ **Enhancement 3** (Notification Count) - Nice to have but not critical

---

## 🔗 Dependencies:

**Enhancement 4 requires Enhancement 2**:
- Reopen message needs store hours data
- Implement Enhancement 2 first, then Enhancement 4

**Enhancements 1 and 3 are independent**:
- Can be implemented in any order
- No dependencies on other features

---

## 📝 Implementation Notes:

### **Testing Requirements**:
- Test auto open/close at boundary times (e.g., 8:59 AM, 9:00 AM, 9:01 AM)
- Test with different timezones
- Test with stores that have different schedules
- Test badge clearing behavior
- Test real-time updates across multiple devices

### **Performance Considerations**:
- Store hours check runs every 1 minute per store owner
- Minimal performance impact (single Firebase read)
- Batch updates for products when store toggles

### **Edge Cases**:
- What if store owner changes hours while store is open?
- What if customer's device time is wrong?
- What if Firebase is offline during schedule check?
- Handle timezone differences (use server time if needed)

---

## 🚀 Future Improvements Beyond These:

1. **Holiday/Special Hours**: Allow stores to set special hours for holidays
2. **Break Times**: Support for lunch breaks (e.g., closed 12-1 PM)
3. **Seasonal Hours**: Different schedules for summer/winter
4. **Push Notifications**: Notify customers when favorite store opens
5. **Store Schedule Preview**: Show store hours on store details page
6. **Analytics**: Track when stores are busiest (peak hours)

---

**Last Updated**: January 2025
**Status**: Documented for future implementation
**Next Priority**: Order synchronization system
