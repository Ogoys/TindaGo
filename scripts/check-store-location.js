/**
 * Diagnostic Script: Check Store Location Data
 * 
 * This script checks if stores have proper location data saved in Firebase
 * and helps diagnose why stores aren't showing on the map after activation.
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

// Firebase config (replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function checkStoreLocations() {
  console.log('🔍 Checking store locations in Firebase...\n');
  
  try {
    // Get all stores
    const storesRef = ref(database, 'stores');
    const snapshot = await get(storesRef);
    
    if (!snapshot.exists()) {
      console.log('❌ No stores found in database');
      return;
    }
    
    const stores = snapshot.val();
    const storeIds = Object.keys(stores);
    
    console.log(`📊 Total stores: ${storeIds.length}\n`);
    
    storeIds.forEach((storeId) => {
      const store = stores[storeId];
      const storeName = store.businessInfo?.storeName || store.storeName || 'Unnamed Store';
      const status = store.status || 'unknown';
      
      console.log(`\n🏪 Store: ${storeName}`);
      console.log(`   ID: ${storeId.substring(0, 8)}...`);
      console.log(`   Status: ${status}`);
      
      // Check location data
      const hasLocation = store.location?.coordinates?.latitude && store.location?.coordinates?.longitude;
      const hasLegacyCoordinates = store.coordinates?.latitude && store.coordinates?.longitude;
      const hasLocationCoordinates = store.locationCoordinates?.latitude && store.locationCoordinates?.longitude;
      
      if (hasLocation) {
        console.log(`   ✅ Location: ${store.location.coordinates.latitude}, ${store.location.coordinates.longitude}`);
        console.log(`   📍 Address: ${store.location.address || 'N/A'}`);
      } else if (hasLegacyCoordinates) {
        console.log(`   ⚠️  Legacy coordinates: ${store.coordinates.latitude}, ${store.coordinates.longitude}`);
      } else if (hasLocationCoordinates) {
        console.log(`   ⚠️  locationCoordinates: ${store.locationCoordinates.latitude}, ${store.locationCoordinates.longitude}`);
      } else {
        console.log(`   ❌ NO LOCATION DATA FOUND`);
        console.log(`      Store data structure:`, Object.keys(store));
        if (store.businessInfo) {
          console.log(`      businessInfo:`, Object.keys(store.businessInfo));
        }
      }
      
      // Check if should show on map
      const shouldShowOnMap = (status === 'active' || status === 'pending' || status === 'pending_documents') && hasLocation;
      console.log(`   ${shouldShowOnMap ? '✅' : '❌'} Should show on map: ${shouldShowOnMap ? 'YES' : 'NO'}`);
    });
    
    console.log('\n\n📊 Summary:');
    const withLocation = storeIds.filter(id => stores[id].location?.coordinates?.latitude && stores[id].location?.coordinates?.longitude);
    const activeStores = storeIds.filter(id => stores[id].status === 'active');
    const activeWithLocation = storeIds.filter(id => stores[id].status === 'active' && stores[id].location?.coordinates?.latitude && stores[id].location?.coordinates?.longitude);
    
    console.log(`Total stores: ${storeIds.length}`);
    console.log(`Stores with location: ${withLocation.length}`);
    console.log(`Active stores: ${activeStores.length}`);
    console.log(`Active stores with location (should show on map): ${activeWithLocation.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkStoreLocations();
