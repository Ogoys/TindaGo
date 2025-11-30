// Run this with: node debug-stores.js
// This will show you all stores in Firebase and their status

const { database } = require('./FirebaseConfig');
const { ref, get } = require('firebase/database');

async function debugStores() {
  try {
    console.log('🔍 Fetching all stores from Firebase...\n');
    
    const storesRef = ref(database, 'stores');
    const snapshot = await get(storesRef);
    
    if (!snapshot.exists()) {
      console.log('❌ No stores found in Firebase');
      return;
    }
    
    const storesData = snapshot.val();
    const storeIds = Object.keys(storesData);
    
    console.log(`📊 Total stores in Firebase: ${storeIds.length}\n`);
    console.log('='.repeat(80));
    
    storeIds.forEach((storeId, index) => {
      const store = storesData[storeId];
      const hasLocation = !!(store.location?.coordinates?.latitude && store.location?.coordinates?.longitude);
      
      console.log(`\n${index + 1}. ${store.businessInfo?.storeName || 'Unnamed Store'}`);
      console.log(`   ID: ${storeId.substring(0, 20)}...`);
      console.log(`   Status: ${store.status}`);
      console.log(`   Has Location: ${hasLocation ? '✅ Yes' : '❌ No'}`);
      
      if (hasLocation) {
        console.log(`   Coordinates: ${store.location.coordinates.latitude}, ${store.location.coordinates.longitude}`);
      }
      
      console.log(`   Has Logo: ${store.businessInfo?.logo ? '✅ Yes' : '❌ No'}`);
      console.log(`   Will Show on Map: ${hasLocation && store.status === 'active' ? '✅ YES' : '❌ NO'}`);
    });
    
    console.log('\n' + '='.repeat(80));
    
    const activeWithLocation = storeIds.filter(id => {
      const store = storesData[id];
      const hasLocation = !!(store.location?.coordinates?.latitude && store.location?.coordinates?.longitude);
      return hasLocation && store.status === 'active';
    });
    
    console.log(`\n✅ Stores that will show on map: ${activeWithLocation.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugStores();
