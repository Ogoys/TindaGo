/**
 * MANUALLY UPDATE PRODUCT DAMAGE COUNT
 * 
 * Updates a specific product's quantityDamaged field
 */

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, update } = require('firebase/database');

const firebaseConfig = {
  apiKey: 'AIzaSyBDeGdo1GmlBTolD7bYhtDyQAqobYSBVnE',
  databaseURL: 'https://tindagoproject-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'tindagoproject'
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Configuration - UPDATE THESE VALUES
const PRODUCT_NAME_SEARCH = 'mushroom'; // Search term (case-insensitive)
const DAMAGE_QUANTITY_TO_ADD = 2; // How many to add to quantityDamaged

async function updateProductDamage() {
  try {
    console.log(`🔍 Searching for product containing: "${PRODUCT_NAME_SEARCH}"...\n`);
    
    // Get all products
    const productsSnapshot = await get(ref(db, 'products'));
    
    if (!productsSnapshot.exists()) {
      console.log('❌ No products found in database');
      process.exit(1);
    }
    
    const products = productsSnapshot.val();
    let foundProduct = null;
    let foundProductId = null;
    
    // Search for product
    Object.entries(products).forEach(([productId, product]) => {
      if (product.productName && 
          product.productName.toLowerCase().includes(PRODUCT_NAME_SEARCH.toLowerCase())) {
        foundProduct = product;
        foundProductId = productId;
      }
    });
    
    if (!foundProduct || !foundProductId) {
      console.log(`❌ No product found containing "${PRODUCT_NAME_SEARCH}"`);
      process.exit(1);
    }
    
    console.log('✅ Found product:');
    console.log(`   Product ID: ${foundProductId}`);
    console.log(`   Name: ${foundProduct.productName}`);
    console.log(`   Current Stock (quantity): ${foundProduct.quantity || 0}`);
    console.log(`   Current Unavailable: ${foundProduct.quantityUnavailable || 0}`);
    console.log(`   Current Damaged: ${foundProduct.quantityDamaged || 0}`);
    console.log('');
    
    const currentDamaged = foundProduct.quantityDamaged || 0;
    const newDamaged = currentDamaged + DAMAGE_QUANTITY_TO_ADD;
    
    console.log(`📝 Updating damage count:`);
    console.log(`   ${currentDamaged} → ${newDamaged} (+${DAMAGE_QUANTITY_TO_ADD})`);
    console.log('');
    
    // Update the product
    await update(ref(db, `products/${foundProductId}`), {
      quantityDamaged: newDamaged,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Product updated successfully!');
    console.log('');
    console.log('📊 New inventory totals:');
    console.log(`   Stock: ${foundProduct.quantity || 0}`);
    console.log(`   Unavailable: ${foundProduct.quantityUnavailable || 0}`);
    console.log(`   Damaged: ${newDamaged}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

updateProductDamage();
