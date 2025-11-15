# 🚀 TindaGo Order Tracking & Review System - Complete Implementation Guide

**Version:** 2.0  
**Date:** 2025-01-15  
**Status:** Ready for Implementation  
**Estimated Time:** 17-24 hours

---

## 📋 Table of Contents

1. [Complete User Flow](#complete-user-flow)
2. [Screen-by-Screen Implementation](#screen-by-screen-implementation)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema](#database-schema)
5. [Implementation Phases](#implementation-phases)
6. [Component Library](#component-library)
7. [Testing Checklist](#testing-checklist)

---

## 🔄 Complete User Flow

```
CUSTOMER CHECKOUT → Xendit Payment
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ 1. ORDER COMPLETE SCREEN                                        │
│    - Payment success confirmation                               │
│    - Order number displayed                                     │
│    - "Track Store" button (PRIMARY)                            │
│    - "View Order Details" button (secondary)                   │
└─────────────────────────────────────────────────────────────────┘
         ↓ [User taps "Track Store"]
┌─────────────────────────────────────────────────────────────────┐
│ 2. TRACK STORE SCREEN                                          │
│    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│    ┃ MAP VIEW (Top Section)                                  ┃ │
│    ┃ - Customer location pin (blue dot)                      ┃ │
│    ┃ - Store location pin (red marker)                       ┃ │
│    ┃ - Route polyline (when "Show Route" pressed)            ┃ │
│    ┃                                                          ┃ │
│    ┃ [Show Route] [Navigate] [View Products] [Set as My]    ┃ │
│    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│    ┃ ORDER STATUS TIMELINE (Bottom Section)                  ┃ │
│    ┃ ✓ Order Placed        [10:30 AM]                        ┃ │
│    ┃ ● Preparing Order     [Active]                          ┃ │
│    ┃ ○ Ready for Pickup    [Pending]                         ┃ │
│    ┃ ○ Order Completed     [Pending]                         ┃ │
│    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│    [Order View Details] (Fixed bottom button)                   │
│                                                                 │
│    Figma: node-id=1428-1585                                     │
└─────────────────────────────────────────────────────────────────┘
         ↓ [User taps "Order View Details"]
┌─────────────────────────────────────────────────────────────────┐
│ 3. ORDER TRACKING SCREEN                                        │
│    (Same as existing order-details.tsx)                         │
│    - Order ID and payment status badge                          │
│    - Store name                                                 │
│    - Status timeline (4 steps)                                  │
│    - Bill card with items summary                               │
│    - "View Invoice" button (underlined, teal)                  │
│    - Payment method card                                        │
│                                                                 │
│    Figma: node-id=1428-1668                                     │
└─────────────────────────────────────────────────────────────────┘
         ↓ [User taps "View Invoice"]
┌─────────────────────────────────────────────────────────────────┐
│ 4. INVOICE SCREEN                                               │
│    - Invoice number and date                                    │
│    - Store information                                          │
│    - Itemized product list:                                     │
│      • Product name                                             │
│      • Quantity × Unit price                                    │
│      • Subtotal per item                                        │
│    - Totals section:                                            │
│      • Subtotal                                                 │
│      • Service fee (if any)                                     │
│      • Discount (if any)                                        │
│      • Grand Total (highlighted)                                │
│    - Payment information                                        │
│    - Transaction ID                                             │
│    - Download/Share button                                      │
│                                                                 │
│    Figma: node-id=1428-1813                                     │
└─────────────────────────────────────────────────────────────────┘
         ↓ [Store owner marks order as "Completed/Picked Up"]
┌─────────────────────────────────────────────────────────────────┐
│ 5. ORDER COMPLETE MODAL (Automatic Popup)                      │
│    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│    ┃     ✓ Success Icon/Animation                            ┃ │
│    ┃                                                          ┃ │
│    ┃     "Your order is complete!"                           ┃ │
│    ┃     "Thank you for shopping with us."                   ┃ │
│    ┃     "How was your experience?"                          ┃ │
│    ┃                                                          ┃ │
│    ┃     [Give Feedback Now] (Green button)                  ┃ │
│    ┃     [Later] (Gray outline button)                       ┃ │
│    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                                 │
│    Figma: node-id=1428-1563                                     │
└─────────────────────────────────────────────────────────────────┘
         ↓ [User taps "Give Feedback Now"]
┌─────────────────────────────────────────────────────────────────┐
│ 6. REVIEW SCREEN                                                │
│    - Store logo and name                                        │
│    - Order number reference                                     │
│                                                                 │
│    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│    ┃ "How would you rate your experience?"                   ┃ │
│    ┃                                                          ┃ │
│    ┃ ★ ★ ★ ★ ★ (Interactive 5-star rating)                  ┃ │
│    ┃                                                          ┃ │
│    ┃ "Share your thoughts"                                   ┃ │
│    ┃ ┌──────────────────────────────────────────────────┐   ┃ │
│    ┃ │ Tell us about your experience...                 │   ┃ │
│    ┃ │                                                  │   ┃ │
│    ┃ │ (Multiline text area)                            │   ┃ │
│    ┃ └──────────────────────────────────────────────────┘   ┃ │
│    ┃                                                          ┃ │
│    ┃ "Add photos (optional)"                                 ┃ │
│    ┃ [📷] [Image 1] [Image 2]  (Up to 3 images)             ┃ │
│    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                                 │
│    [Rate Now] (Primary green button)                           │
│    [Back to Home] (Secondary outline button)                   │
│                                                                 │
│    Figma: node-id=1428-1773                                     │
└─────────────────────────────────────────────────────────────────┘
         ↓ [User taps "Rate Now"]
┌─────────────────────────────────────────────────────────────────┐
│ 7. REVIEW SUCCESS MODAL                                         │
│    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│    ┃     ✓ Success Icon/Star Animation                       ┃ │
│    ┃                                                          ┃ │
│    ┃     "Thank you for your feedback!"                      ┃ │
│    ┃     "Your review helps us improve our service"          ┃ │
│    ┃                                                          ┃ │
│    ┃     [Back to Home] (Green button)                       ┃ │
│    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                                 │
│    Auto-dismisses after 3 seconds OR user taps button           │
│    Navigates to customer home screen                            │
│                                                                 │
│    Figma: node-id=1439-184                                      │
└─────────────────────────────────────────────────────────────────┘
         ↓
    [Customer Home Screen]
```

---

## 📱 Screen-by-Screen Implementation

### 🟢 Screen 1: Order Complete Screen

**File:** `app/(main)/(customer)/order-complete.tsx`  
**Route:** `/(main)/(customer)/order-complete?orderId={orderId}`  
**Triggered By:** Xendit webhook payment success callback

#### Purpose
Show payment confirmation and provide quick access to order tracking.

#### Key Components
```typescript
interface OrderCompleteProps {
  orderId: string;
  orderNumber: string;
  paymentStatus: 'PAID' | 'SETTLED';
  total: number;
  storeName: string;
  storeId: string;
  paymentMethod: string;
  transactionId: string;
}
```

#### UI Elements
1. **Success Animation** - Checkmark or celebration animation (Lottie)
2. **Order Confirmation Card**
   - Order number (e.g., "ORD-2025-001234")
   - Payment status badge (green "Paid")
   - Total amount (₱XXX.XX)
   - Store name
3. **Action Buttons**
   - **"Track Store"** (Primary green button) → Navigate to track-store screen
   - **"View Order Details"** (Secondary outline) → Navigate to order-tracking screen
   - **"Back to Home"** (Text button at bottom)

#### Key Functions
```typescript
// Navigate to track store with order ID
const handleTrackStore = () => {
  router.push(`/(main)/(customer)/track-store?orderId=${orderId}` as any);
};

// Navigate to order tracking
const handleViewDetails = () => {
  router.push(`/(main)/(customer)/order-tracking?orderId=${orderId}` as any);
};
```

#### State Management
```typescript
const [orderData, setOrderData] = useState<OrderCompleteProps | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  // Fetch order details from Firebase
  const orderRef = ref(database, `orders/${orderId}`);
  const unsubscribe = onValue(orderRef, (snapshot) => {
    if (snapshot.exists()) {
      setOrderData(snapshot.val());
    }
    setLoading(false);
  });
  return () => unsubscribe();
}, [orderId]);
```

---

### 🗺️ Screen 2: Track Store Screen (MOST IMPORTANT!)

**File:** `app/(main)/(customer)/track-store.tsx`  
**Route:** `/(main)/(customer)/track-store?orderId={orderId}`  
**Figma:** [node-id=1428-1585](https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1428-1585&m=dev)

#### Purpose
Show real-time map with customer and store locations, display route, provide navigation, and show order status timeline.

#### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│ Header (Back, Title, Notification)                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│         MAP VIEW (60% of screen)                    │
│   - Customer Pin (Blue Dot)                         │
│   - Store Pin (Red Marker)                          │
│   - Route Polyline (when enabled)                   │
│                                                     │
├─────────────────────────────────────────────────────┤
│ ACTION BUTTONS GRID (2×2)                           │
│ ┌───────────┬───────────┐                          │
│ │Show Route │ Navigate  │                          │
│ └───────────┴───────────┘                          │
│ ┌───────────┬───────────┐                          │
│ │View       │Set as My  │                          │
│ │Products   │Store      │                          │
│ └───────────┴───────────┘                          │
├─────────────────────────────────────────────────────┤
│ ORDER STATUS TIMELINE (Scrollable)                  │
│                                                     │
│ ✓ Order Placed         [10:30 AM]                   │
│ ● Preparing Your Order [Active]                     │
│ ○ Ready for Pickup     [Pending]                    │
│ ○ Order Completed      [Pending]                    │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [Order View Details] (Fixed bottom button)          │
└─────────────────────────────────────────────────────┘
```

#### Map Implementation
```typescript
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

// State for map
const [customerLocation, setCustomerLocation] = useState<LatLng | null>(null);
const [storeLocation, setStoreLocation] = useState<LatLng | null>(null);
const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
const [showRoute, setShowRoute] = useState(false);
const [mapReady, setMapReady] = useState(false);

// Get customer location
useEffect(() => {
  (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    setCustomerLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  })();
}, []);

// Fetch store location from order
useEffect(() => {
  const orderRef = ref(database, `orders/${orderId}`);
  onValue(orderRef, async (snapshot) => {
    if (snapshot.exists()) {
      const order = snapshot.val();
      setOrder(order);
      
      // Get store location
      const storeRef = ref(database, `stores/${order.storeId}`);
      const storeSnap = await get(storeRef);
      
      if (storeSnap.exists()) {
        const store = storeSnap.val();
        if (store.location?.coordinates) {
          setStoreLocation({
            latitude: store.location.coordinates.latitude,
            longitude: store.location.coordinates.longitude,
          });
        }
      }
    }
  });
}, [orderId]);

// Fit map to show both pins
useEffect(() => {
  if (mapReady && customerLocation && storeLocation && mapRef.current) {
    mapRef.current.fitToCoordinates(
      [customerLocation, storeLocation],
      {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      }
    );
  }
}, [mapReady, customerLocation, storeLocation]);
```

#### Show Route Function (Google Directions API)
```typescript
const handleShowRoute = async () => {
  if (!customerLocation || !storeLocation) return;
  
  try {
    const origin = `${customerLocation.latitude},${customerLocation.longitude}`;
    const destination = `${storeLocation.latitude},${storeLocation.longitude}`;
    
    // Use Google Directions API (you'll need API key)
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.routes.length > 0) {
      const points = data.routes[0].overview_polyline.points;
      const coords = decodePolyline(points);
      setRouteCoordinates(coords);
      setShowRoute(true);
    }
  } catch (error) {
    console.error('Error fetching route:', error);
  }
};

// Decode Google polyline
const decodePolyline = (encoded: string): LatLng[] => {
  const poly = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  
  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    
    poly.push({
      latitude: (lat / 1E5),
      longitude: (lng / 1E5),
    });
  }
  return poly;
};
```

#### Navigate Button (Open Google Maps)
```typescript
const handleNavigate = () => {
  if (!storeLocation) return;
  
  const scheme = Platform.select({
    ios: 'maps:0,0?q=',
    android: 'geo:0,0?q=',
  });
  const latLng = `${storeLocation.latitude},${storeLocation.longitude}`;
  const label = encodeURIComponent(order?.storeName || 'Store');
  const url = Platform.select({
    ios: `${scheme}${label}@${latLng}`,
    android: `${scheme}${latLng}(${label})`,
  });
  
  Linking.openURL(url);
};
```

#### Action Buttons Grid
```typescript
const actionButtons = [
  {
    label: 'Show Route',
    icon: 'navigate-outline',
    color: '#0066FF',
    onPress: handleShowRoute,
  },
  {
    label: 'Navigate',
    icon: 'compass-outline',
    color: '#0066FF',
    onPress: handleNavigate,
  },
  {
    label: 'View Products',
    icon: 'storefront-outline',
    color: '#3BB77E',
    onPress: () => router.push(`/(main)/shared/store-details?storeId=${order?.storeId}` as any),
  },
  {
    label: 'Set as My Store',
    icon: 'star-outline',
    color: '#3BB77E',
    onPress: handleSetFavoriteStore,
  },
];
```

#### Order Timeline Component
```typescript
// Reusable component - extract to components/tracking/OrderTimeline.tsx
const OrderTimeline: React.FC<{ order: Order }> = ({ order }) => {
  const steps = [
    { status: 'pending', label: 'Order Placed', icon: '📋' },
    { status: 'preparing', label: 'Preparing Your Order', icon: '🛍️' },
    { status: 'ready', label: 'Ready for Pickup', icon: '✅' },
    { status: 'picked_up', label: 'Order Completed', icon: '📦' },
  ];
  
  const statusOrder = ['pending', 'preparing', 'ready', 'picked_up'];
  const currentIndex = statusOrder.indexOf(order.status);
  
  return (
    <View style={styles.timeline}>
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isActive = index === currentIndex;
        
        return (
          <View key={step.status} style={styles.timelineItem}>
            <View style={styles.iconContainer}>
              <View style={[
                styles.dot,
                isCompleted && styles.dotCompleted,
                isActive && styles.dotActive,
              ]} />
              {index < steps.length - 1 && (
                <View style={[
                  styles.line,
                  isCompleted && styles.lineCompleted,
                ]} />
              )}
            </View>
            <View style={styles.content}>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {step.icon} {step.label}
              </Text>
              <Text style={styles.time}>
                {isCompleted ? formatTime(order.updatedAt) : 'Pending'}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};
```

---

### 📊 Screen 3: Order Tracking Screen

**File:** `app/(main)/(customer)/order-tracking.tsx`  
**Route:** `/(main)/(customer)/order-tracking?orderId={orderId}`  
**Figma:** [node-id=1428-1668](https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1428-1668&m=dev)  
**Reference:** Copy from existing `order-details.tsx`

#### Purpose
Detailed order information with invoice access.

#### Implementation Note
This screen is essentially the same as your existing `order-details.tsx`. The key addition is:

**View Invoice Button** in the Bill Card:
```typescript
<View style={styles.billCard}>
  <View style={styles.billHeader}>
    <Text style={styles.billTitle}>Bill</Text>
  </View>
  
  <View style={styles.billRow}>
    <Text style={styles.billLabel}>{order.items.length} Items</Text>
    <Text style={styles.billValue}>₱{order.subtotal.toFixed(2)}</Text>
  </View>
  
  <View style={styles.dashedDivider} />
  
  <View style={styles.totalRow}>
    <Text style={styles.totalLabel}>Grand Total</Text>
    <Text style={styles.totalValue}>₱{order.total.toFixed(2)}</Text>
  </View>
  
  {/* NEW: View Invoice Button */}
  <TouchableOpacity
    style={styles.viewInvoiceButton}
    onPress={() => router.push(`/(main)/(customer)/invoice?orderId=${orderId}` as any)}
  >
    <Text style={styles.viewInvoiceText}>View Invoice</Text>
  </TouchableOpacity>
</View>

// Styles
viewInvoiceButton: {
  marginTop: 15,
  alignItems: 'center',
},
viewInvoiceText: {
  fontSize: 14,
  color: '#3BB77E',
  textDecorationLine: 'underline',
  fontWeight: '500',
},
```

---

### 🧾 Screen 4: Invoice Screen

**File:** `app/(main)/(customer)/invoice.tsx`  
**Route:** `/(main)/(customer)/invoice?orderId={orderId}`  
**Figma:** [node-id=1428-1813](https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1428-1813&m=dev)

#### Purpose
Complete itemized invoice with download/share capability.

#### Layout Structure
```typescript
interface InvoiceData {
  invoiceNumber: string;        // e.g., "INV-2025-001234"
  orderNumber: string;           // e.g., "ORD-2025-001234"
  orderDate: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  customerName: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  serviceFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
}

interface InvoiceItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
```

#### UI Components
```typescript
<ScrollView style={styles.container}>
  {/* Header */}
  <View style={styles.header}>
    <TouchableOpacity onPress={() => router.back()}>
      <Ionicons name="arrow-back" size={24} />
    </TouchableOpacity>
    <Text style={styles.title}>Invoice</Text>
    <TouchableOpacity onPress={handleDownloadInvoice}>
      <Ionicons name="download-outline" size={24} />
    </TouchableOpacity>
  </View>
  
  {/* Invoice Details */}
  <View style={styles.invoiceCard}>
    <Text style={styles.invoiceNumber}>Invoice #{invoiceNumber}</Text>
    <Text style={styles.orderDate}>{formatDate(orderDate)}</Text>
    
    {/* Store Information */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>From</Text>
      <Text style={styles.storeName}>{storeName}</Text>
      <Text style={styles.storeAddress}>{storeAddress}</Text>
      <Text style={styles.storePhone}>{storePhone}</Text>
    </View>
    
    {/* Customer Information */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>To</Text>
      <Text style={styles.customerName}>{customerName}</Text>
      <Text style={styles.customerAddress}>{customerAddress}</Text>
    </View>
    
    {/* Items Table */}
    <View style={styles.itemsSection}>
      <Text style={styles.sectionTitle}>Items</Text>
      
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { flex: 2 }]}>Item</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Qty</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Price</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>Total</Text>
      </View>
      
      {/* Items */}
      {items.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 2 }]}>{item.productName}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>{item.quantity}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>₱{item.unitPrice.toFixed(2)}</Text>
          <Text style={[styles.tableCell, { flex: 1 }]}>₱{item.subtotal.toFixed(2)}</Text>
        </View>
      ))}
    </View>
    
    {/* Totals */}
    <View style={styles.totalsSection}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Subtotal</Text>
        <Text style={styles.totalValue}>₱{subtotal.toFixed(2)}</Text>
      </View>
      
      {serviceFee > 0 && (
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Service Fee</Text>
          <Text style={styles.totalValue}>₱{serviceFee.toFixed(2)}</Text>
        </View>
      )}
      
      {discount > 0 && (
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Discount</Text>
          <Text style={[styles.totalValue, { color: '#3BB77E' }]}>
            -₱{discount.toFixed(2)}
          </Text>
        </View>
      )}
      
      <View style={styles.dashedDivider} />
      
      <View style={styles.grandTotalRow}>
        <Text style={styles.grandTotalLabel}>Grand Total</Text>
        <Text style={styles.grandTotalValue}>₱{total.toFixed(2)}</Text>
      </View>
    </View>
    
    {/* Payment Information */}
    <View style={styles.paymentSection}>
      <Text style={styles.sectionTitle}>Payment Information</Text>
      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>Method</Text>
        <Text style={styles.paymentValue}>{paymentMethod}</Text>
      </View>
      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>Status</Text>
        <View style={[styles.statusBadge, { backgroundColor: '#34C759' }]}>
          <Text style={styles.statusText}>{paymentStatus}</Text>
        </View>
      </View>
      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>Transaction ID</Text>
        <Text style={styles.paymentValue}>{transactionId}</Text>
      </View>
    </View>
    
    {/* Footer */}
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Thank you for your business!
      </Text>
      <Text style={styles.footerContact}>
        For questions, contact us at {storePhone}
      </Text>
    </View>
  </View>
</ScrollView>
```

#### Download/Share Invoice
```typescript
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const handleDownloadInvoice = async () => {
  try {
    // Generate HTML for invoice
    const html = generateInvoiceHTML(invoiceData);
    
    // Create PDF
    const { uri } = await Print.printToFileAsync({ html });
    
    // Share PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Invoice',
        UTI: 'com.adobe.pdf',
      });
    }
  } catch (error) {
    console.error('Error generating invoice:', error);
    Alert.alert('Error', 'Failed to generate invoice');
  }
};

const generateInvoiceHTML = (data: InvoiceData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .invoice-number { font-size: 24px; font-weight: bold; }
        .section { margin: 20px 0; }
        .section-title { font-weight: bold; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #3BB77E; color: white; }
        .totals { text-align: right; margin: 20px 0; }
        .grand-total { font-size: 20px; font-weight: bold; color: #3BB77E; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="invoice-number">Invoice #${data.invoiceNumber}</div>
        <div>Order: ${data.orderNumber}</div>
        <div>Date: ${data.orderDate}</div>
      </div>
      
      <div class="section">
        <div class="section-title">From</div>
        <div>${data.storeName}</div>
        <div>${data.storeAddress}</div>
        <div>${data.storePhone}</div>
      </div>
      
      <div class="section">
        <div class="section-title">To</div>
        <div>${data.customerName}</div>
        <div>${data.customerAddress}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
            <tr>
              <td>${item.productName}</td>
              <td>${item.quantity}</td>
              <td>₱${item.unitPrice.toFixed(2)}</td>
              <td>₱${item.subtotal.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals">
        <div>Subtotal: ₱${data.subtotal.toFixed(2)}</div>
        ${data.serviceFee > 0 ? `<div>Service Fee: ₱${data.serviceFee.toFixed(2)}</div>` : ''}
        ${data.discount > 0 ? `<div>Discount: -₱${data.discount.toFixed(2)}</div>` : ''}
        <div class="grand-total">Grand Total: ₱${data.total.toFixed(2)}</div>
      </div>
      
      <div class="section">
        <div class="section-title">Payment Information</div>
        <div>Method: ${data.paymentMethod}</div>
        <div>Status: ${data.paymentStatus}</div>
        <div>Transaction ID: ${data.transactionId}</div>
      </div>
    </body>
    </html>
  `;
};
```

---

### 🎉 Screen 5: Order Complete Modal

**File:** `src/components/modals/OrderCompleteModal.tsx`  
**Type:** Modal Component  
**Figma:** [node-id=1428-1563](https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1428-1563&m=dev)

#### Purpose
Automatic popup when store marks order as completed, prompting customer for feedback.

#### Trigger Logic
```typescript
// In order-tracking.tsx or track-store.tsx
useEffect(() => {
  const orderRef = ref(database, `orders/${orderId}`);
  const unsubscribe = onValue(orderRef, (snapshot) => {
    if (snapshot.exists()) {
      const order = snapshot.val();
      
      // Check if order status changed to completed
      if (order.status === 'picked_up' && !order.hasReview) {
        setShowOrderCompleteModal(true);
      }
    }
  });
  
  return () => unsubscribe();
}, [orderId]);
```

#### Component Implementation
```typescript
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

interface OrderCompleteModalProps {
  visible: boolean;
  orderId: string;
  storeName: string;
  onFeedbackPress: () => void;
  onLaterPress: () => void;
}

export const OrderCompleteModal: React.FC<OrderCompleteModalProps> = ({
  visible,
  orderId,
  storeName,
  onFeedbackPress,
  onLaterPress,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onLaterPress}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Success Animation */}
          <View style={styles.iconContainer}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={60} color="#FFFFFF" />
            </View>
          </View>
          
          {/* Title */}
          <Text style={styles.title}>Your order is complete!</Text>
          
          {/* Message */}
          <Text style={styles.message}>
            Thank you for shopping with {storeName}.
          </Text>
          <Text style={styles.submessage}>
            How was your experience?
          </Text>
          
          {/* Buttons */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onFeedbackPress}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Give Feedback Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onLaterPress}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 5,
    textAlign: 'center',
  },
  submessage: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#3BB77E',
    borderRadius: 15,
    paddingVertical: 16,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 15,
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
```

---

### ⭐ Screen 6: Review Screen

**File:** `app/(main)/(customer)/review.tsx`  
**Route:** `/(main)/(customer)/review?orderId={orderId}`  
**Figma:** [node-id=1428-1773](https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1428-1773&m=dev)

#### Purpose
Allow customers to rate and review their order experience.

#### Component Implementation
```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, get, update, push, set } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import { uploadImageToCloudinary } from '../../../src/lib/upload/cloudinary';
import { useUser } from '../../../src/contexts/UserContext';
import { StarRating } from '../../../src/components/review/StarRating';

export default function ReviewScreen() {
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const { user } = useUser();
  
  // State
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Fetch order data
  useEffect(() => {
    (async () => {
      try {
        const orderRef = ref(database, `orders/${orderId}`);
        const snapshot = await get(orderRef);
        
        if (snapshot.exists()) {
          setOrder(snapshot.val());
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);
  
  // Pick image
  const handlePickImage = async () => {
    if (images.length >= 3) {
      Alert.alert('Limit Reached', 'You can only upload up to 3 images');
      return;
    }
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please allow access to your photos');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets[0]) {
      setImages([...images, result.assets[0].uri]);
    }
  };
  
  // Remove image
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  
  // Submit review
  const handleSubmitReview = async () => {
    // Validation
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating');
      return;
    }
    
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Upload images to Cloudinary
      const imageUrls: string[] = [];
      for (const imageUri of images) {
        const url = await uploadImageToCloudinary(imageUri);
        imageUrls.push(url);
      }
      
      // Create review in Firebase
      const reviewsRef = ref(database, 'reviews');
      const newReviewRef = push(reviewsRef);
      
      const reviewData = {
        orderId,
        storeId: order.storeId,
        customerId: user.id,
        customerName: user.displayName || user.name,
        rating,
        comment: comment.trim(),
        images: imageUrls,
        createdAt: new Date().toISOString(),
        status: 'published',
      };
      
      await set(newReviewRef, reviewData);
      
      // Update order with review reference
      const orderRef = ref(database, `orders/${orderId}`);
      await update(orderRef, {
        hasReview: true,
        reviewId: newReviewRef.key,
        reviewedAt: new Date().toISOString(),
      });
      
      // Update store rating
      await updateStoreRating(order.storeId);
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Navigate to home after 3 seconds
      setTimeout(() => {
        router.replace('/(main)/(customer)/home' as any);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Update store rating
  const updateStoreRating = async (storeId: string) => {
    try {
      const reviewsRef = ref(database, 'reviews');
      const snapshot = await get(reviewsRef);
      
      if (snapshot.exists()) {
        const allReviews = snapshot.val();
        const storeReviews = Object.values(allReviews).filter(
          (r: any) => r.storeId === storeId && r.status === 'published'
        );
        
        const totalRating = storeReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
        const avgRating = totalRating / storeReviews.length;
        
        const storeRef = ref(database, `stores/${storeId}`);
        await update(storeRef, {
          rating: avgRating,
          totalReviews: storeReviews.length,
        });
      }
    } catch (error) {
      console.error('Error updating store rating:', error);
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#3BB77E" />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1E1E1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review</Text>
          <View style={{ width: 24 }} />
        </View>
        
        {/* Store Info */}
        <View style={styles.storeInfo}>
          {order?.storeLogo && (
            <Image
              source={{ uri: order.storeLogo }}
              style={styles.storeLogo}
            />
          )}
          <Text style={styles.storeName}>{order?.storeName}</Text>
          <Text style={styles.orderRef}>Order #{order?.orderNumber}</Text>
        </View>
        
        {/* Star Rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>
            How would you rate your experience?
          </Text>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            size={50}
          />
        </View>
        
        {/* Comment */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Share your thoughts</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Tell us about your experience..."
            placeholderTextColor="#999999"
            multiline
            numberOfLines={5}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>
        
        {/* Image Upload */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Add photos (optional)</Text>
          
          <View style={styles.imagesContainer}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imagePreview}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#E92B45" />
                </TouchableOpacity>
              </View>
            ))}
            
            {images.length < 3 && (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handlePickImage}
              >
                <Ionicons name="camera-outline" size={40} color="#999999" />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmitReview}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Rate Now</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace('/(main)/(customer)/home' as any)}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <ReviewSuccessModal
          visible={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            router.replace('/(main)/(customer)/home' as any);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  storeInfo: {
    alignItems: 'center',
    padding: 20,
  },
  storeLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: 5,
  },
  orderRef: {
    fontSize: 14,
    color: '#666666',
  },
  ratingSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: 15,
  },
  commentSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 15,
  },
  commentInput: {
    backgroundColor: '#F4F6F6',
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: '#1E1E1E',
    minHeight: 120,
  },
  imageSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 15,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 5,
  },
  buttonsContainer: {
    padding: 20,
  },
  submitButton: {
    backgroundColor: '#3BB77E',
    borderRadius: 15,
    paddingVertical: 16,
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 15,
    paddingVertical: 16,
  },
  homeButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
```

#### Star Rating Component
```typescript
// src/components/review/StarRating.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  color?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 40,
  color = '#FFD700',
}) => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRatingChange(star)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? color : '#CCCCCC'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
  },
});
```

---

### ✅ Screen 7: Review Success Modal

**File:** `src/components/modals/ReviewSuccessModal.tsx`  
**Type:** Modal Component  
**Figma:** [node-id=1439-184](https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=1439-184&m=dev)

#### Component Implementation
```typescript
import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReviewSuccessModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ReviewSuccessModal: React.FC<ReviewSuccessModalProps> = ({
  visible,
  onClose,
}) => {
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.successCircle}>
              <Ionicons name="star" size={60} color="#FFFFFF" />
            </View>
          </View>
          
          {/* Title */}
          <Text style={styles.title}>Thank you for your feedback!</Text>
          
          {/* Message */}
          <Text style={styles.message}>
            Your review helps us improve our service
          </Text>
          
          {/* Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#3BB77E',
    borderRadius: 15,
    paddingVertical: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
```

---

## 💾 Database Schema

### Orders Collection Updates
```json
{
  "orders": {
    "{orderId}": {
      // ... existing fields ...
      "hasReview": false,
      "reviewId": null,
      "reviewedAt": null,
      "completedAt": "2025-01-15T10:00:00Z"
    }
  }
}
```

### Reviews Collection (New Structure for Order Reviews)
```json
{
  "reviews": {
    "{reviewId}": {
      "orderId": "ORD-2025-001234",
      "storeId": "store123",
      "customerId": "cust456",
      "customerName": "Juan Dela Cruz",
      "rating": 5,
      "comment": "Great service!",
      "images": [
        "https://res.cloudinary.com/.../review1.jpg",
        "https://res.cloudinary.com/.../review2.jpg"
      ],
      "createdAt": "2025-01-15T10:30:00Z",
      "status": "published"
    }
  }
}
```

### Stores Collection Updates
```json
{
  "stores": {
    "{storeId}": {
      // ... existing fields ...
      "rating": 4.5,
      "totalReviews": 120
    }
  }
}
```

---

## 📦 Implementation Phases

### Phase 1: Order Complete Screen (2-3 hours)
- [ ] Create `order-complete.tsx`
- [ ] Add success animation (Lottie or custom)
- [ ] Implement "Track Store" navigation
- [ ] Test with Xendit webhook

### Phase 2: Track Store Screen (4-6 hours)
- [ ] Create `track-store.tsx`
- [ ] Implement map with customer/store pins
- [ ] Add route polyline functionality
- [ ] Create action buttons grid
- [ ] Implement navigation to Google Maps
- [ ] Add order timeline component
- [ ] Test location permissions

### Phase 3: Order Tracking & Invoice (3-4 hours)
- [ ] Create `order-tracking.tsx` (copy from order-details)
- [ ] Add "View Invoice" button
- [ ] Create `invoice.tsx`
- [ ] Implement PDF generation
- [ ] Add share functionality
- [ ] Test invoice accuracy

### Phase 4: Order Complete Modal (1-2 hours)
- [ ] Create `OrderCompleteModal.tsx`
- [ ] Add order status listener
- [ ] Implement modal trigger logic
- [ ] Test modal appearance timing

### Phase 5: Review Screen (4-5 hours)
- [ ] Create `review.tsx`
- [ ] Implement `StarRating` component
- [ ] Add image picker (up to 3 images)
- [ ] Create review submission logic
- [ ] Update store rating calculation
- [ ] Test complete review flow

### Phase 6: Review Success Modal (1 hour)
- [ ] Create `ReviewSuccessModal.tsx`
- [ ] Add auto-dismiss timer
- [ ] Implement navigation to home
- [ ] Test modal flow

### Phase 7: Integration & Testing (2-3 hours)
- [ ] Connect all screens
- [ ] Test complete user journey
- [ ] Handle edge cases
- [ ] Add error handling
- [ ] Performance testing

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] Order complete screen shows after payment
- [ ] Track store button navigates correctly
- [ ] Map displays customer and store pins
- [ ] Show route draws polyline
- [ ] Navigate opens Google Maps
- [ ] Order timeline updates in real-time
- [ ] Invoice generates correctly
- [ ] Invoice can be shared/downloaded
- [ ] Order complete modal appears on status change
- [ ] Review form validates rating
- [ ] Image picker allows up to 3 images
- [ ] Review submission updates database
- [ ] Store rating recalculates correctly
- [ ] Success modal auto-dismisses
- [ ] Navigation flow is smooth

### Edge Cases
- [ ] No internet connection
- [ ] Location permission denied
- [ ] Invalid order ID
- [ ] Store location missing
- [ ] Image upload failure
- [ ] Review already submitted
- [ ] Modal dismissed prematurely

### Performance
- [ ] Map loads quickly
- [ ] Route rendering is smooth
- [ ] Image upload doesn't block UI
- [ ] Real-time updates don't lag
- [ ] Animations are smooth

---

## 📐 Design Specifications

### Colors
```typescript
const Colors = {
  primary: '#3BB77E',
  success: '#34C759',
  error: '#E92B45',
  warning: '#FFD700',
  navigationBlue: '#0066FF',
  textPrimary: '#1E1E1E',
  textSecondary: 'rgba(30, 30, 30, 0.5)',
  background: '#F4F6F6',
  white: '#FFFFFF',
  border: '#E0E0E0',
};
```

### Typography
```typescript
const Typography = {
  fontFamily: 'Clash Grotesk Variable',
  sizes: {
    h1: 24,
    h2: 20,
    h3: 18,
    body: 16,
    bodySmall: 14,
    caption: 12,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
```

### Spacing
```typescript
const Spacing = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 30,
  xxl: 40,
};
```

---

## 🚀 Quick Start Implementation

1. **Install Dependencies**
```bash
npm install react-native-maps expo-location expo-image-picker expo-print expo-sharing
```

2. **Update app.json**
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow TindaGo to use your location to show nearby stores."
        }
      ]
    ]
  }
}
```

3. **Create File Structure**
```bash
# Screens
touch app/(main)/(customer)/order-complete.tsx
touch app/(main)/(customer)/track-store.tsx
touch app/(main)/(customer)/order-tracking.tsx
touch app/(main)/(customer)/invoice.tsx
touch app/(main)/(customer)/review.tsx

# Components
mkdir -p src/components/modals
mkdir -p src/components/tracking
mkdir -p src/components/review

touch src/components/modals/OrderCompleteModal.tsx
touch src/components/modals/ReviewSuccessModal.tsx
touch src/components/tracking/OrderTimeline.tsx
touch src/components/review/StarRating.tsx
```

4. **Start with Phase 1**
Begin with the Order Complete Screen and work through each phase sequentially.

---

**Last Updated:** 2025-01-15  
**Status:** Ready for Implementation  
**Total Estimated Time:** 17-24 hours  
**Priority:** HIGH - Core E-commerce Feature
