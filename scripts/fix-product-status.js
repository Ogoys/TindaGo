/**
 * FIX PRODUCT STATUS SCRIPT
 * 
 * This script finds and fixes products that have:
 * - quantity = 0 but status = 'available' 
 * 
 * This ensures all out-of-stock products are properly hidden from customers.
 * 
 * Run this once to fix existing data, then the automatic status management
 * will handle all future changes.
 */

const admin = require('firebase-admin');
const serviceAccount = require('../path-to-your-firebase-admin-key.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project.firebaseio.com'
});

const db = admin.database();

async function fixProductStatus() {
  console.log('🔍 Checking all products for status mismatches...\n');
  
  try {
    const productsRef = db.ref('products');
    const snapshot = await productsRef.once('value');
    
    if (!snapshot.exists()) {
      console.log('❌ No products found in database');
      return;
    }
    
    const products = snapshot.val();
    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    
    for (const [productId, product] of Object.entries(products)) {
      const quantity = product.quantity || 0;
      const currentStatus = product.status;
      const correctStatus = quantity === 0 ? 'out_of_stock' : 'available';
      
      if (currentStatus !== correctStatus) {
        console.log(`🔧 Fixing: ${product.productName}`);
        console.log(`   Quantity: ${quantity}`);
        console.log(`   Current Status: ${currentStatus}`);
        console.log(`   Correct Status: ${correctStatus}`);
        
        await productsRef.child(productId).update({
          status: correctStatus,
          updatedAt: new Date().toISOString()
        });
        
        fixedCount++;
        console.log(`   ✅ Fixed!\n`);
      } else {
        alreadyCorrectCount++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Already correct: ${alreadyCorrectCount}`);
    console.log(`   🔧 Fixed: ${fixedCount}`);
    console.log(`   📦 Total products: ${Object.keys(products).length}`);
    
    if (fixedCount > 0) {
      console.log('\n✨ All product statuses are now correct!');
    } else {
      console.log('\n✨ All product statuses were already correct!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

// Run the fix
fixProductStatus();
