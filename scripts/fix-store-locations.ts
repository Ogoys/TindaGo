/**
 * Fix Store Locations Utility
 * 
 * This script helps fix stores that have location data but it's in the wrong structure.
 * It migrates legacy location formats to the current standard format.
 * 
 * Run this if stores are not showing on the map after admin activation.
 */

import { database } from '@/lib/firebase';
import { ref, get, update } from 'firebase/database';

interface LegacyStore {
  // New format (correct)
  location?: {
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    address?: string;
    formattedAddress?: string;
    city?: string;
  };
  
  // Legacy formats (need migration)
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  locationCoordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  city?: string;
  
  // Other fields
  status?: string;
  businessInfo?: {
    storeName?: string;
    address?: string;
    city?: string;
  };
}

async function fixStoreLocations() {
  console.log('🔧 Starting store location fix utility...\n');
  
  try {
    const storesRef = ref(database, 'stores');
    const snapshot = await get(storesRef);
    
    if (!snapshot.exists()) {
      console.log('❌ No stores found in database');
      return;
    }
    
    const stores = snapshot.val() as Record<string, LegacyStore>;
    const storeIds = Object.keys(stores);
    
    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    let noLocationCount = 0;
    
    for (const storeId of storeIds) {
      const store = stores[storeId];
      const storeName = store.businessInfo?.storeName || 'Unnamed Store';
      
      console.log(`\n📍 Checking: ${storeName} (${storeId.substring(0, 8)}...)`);
      
      // Check if already has correct format
      const hasCorrectFormat = store.location?.coordinates?.latitude && 
                              store.location?.coordinates?.longitude;
      
      if (hasCorrectFormat) {
        console.log('  ✅ Already in correct format');
        alreadyCorrectCount++;
        continue;
      }
      
      // Check for legacy formats
      const hasLegacyCoords = store.coordinates?.latitude && store.coordinates?.longitude;
      const hasLocationCoords = store.locationCoordinates?.latitude && store.locationCoordinates?.longitude;
      
      if (!hasLegacyCoords && !hasLocationCoords) {
        console.log('  ⚠️  No location data found - store needs to set location');
        noLocationCount++;
        continue;
      }
      
      // Migrate to correct format
      console.log('  🔄 Migrating location data...');
      
      const coordinates = hasLegacyCoords ? store.coordinates : store.locationCoordinates;
      const address = store.address || store.businessInfo?.address || 'Address not set';
      const city = store.city || store.businessInfo?.city || 'Davao City';
      
      const locationUpdate = {
        location: {
          coordinates: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          },
          address: address,
          formattedAddress: address,
          city: city,
          setAt: new Date().toISOString(),
          setMethod: 'migrated',
        },
        // Update businessInfo for consistency
        'businessInfo/address': address,
        'businessInfo/city': city,
      };
      
      // Update both stores and store_registrations
      const storeRef = ref(database, `stores/${storeId}`);
      await update(storeRef, locationUpdate);
      
      const registrationRef = ref(database, `store_registrations/${storeId}`);
      try {
        await update(registrationRef, locationUpdate);
      } catch (e) {
        console.log('  ℹ️  No registration record (this is ok)');
      }
      
      console.log('  ✅ Location migrated successfully');
      console.log(`     Coords: ${coordinates.latitude}, ${coordinates.longitude}`);
      console.log(`     Address: ${address}`);
      
      fixedCount++;
    }
    
    console.log('\n\n📊 Summary:');
    console.log(`Total stores: ${storeIds.length}`);
    console.log(`Already correct: ${alreadyCorrectCount}`);
    console.log(`Fixed: ${fixedCount}`);
    console.log(`No location data: ${noLocationCount}`);
    console.log('\n✅ Location fix utility completed!');
    
    if (noLocationCount > 0) {
      console.log('\n⚠️  Note: Some stores have no location data.');
      console.log('   Store owners need to set their location via the app.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the fix
fixStoreLocations().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
