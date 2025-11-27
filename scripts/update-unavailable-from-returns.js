/**
 * UPDATE QUANTITY UNAVAILABLE FROM RETURNS
 * 
 * Scans all return history and updates product.quantityUnavailable
 * for products that have Replace Product refunds (resolved status)
 */

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, update } = require('firebase/database');
const fs = require('fs');

// Read Firebase config from FirebaseConfig.ts
const configContent = fs.readFileSync('./FirebaseConfig.ts', 'utf8');

// Extract config object
const apiKeyMatch = configContent.match(/apiKey:\s*['"]([^'"]+)['"]/);  
const authDomainMatch = configContent.match(/authDomain:\s*['"]([^'"]+)['"]/);  
const databaseURLMatch = configContent.match(/databaseURL:\s*['"]([^'"]+)['"]/);  
const projectIdMatch = configContent.match(/projectId:\s*['"]([^'"]+)['"]/);  
const storageBucketMatch = configContent.match(/storageBucket:\s*['"]([^'"]+)['"]/);  
const messagingSenderIdMatch = configContent.match(/messagingSenderId:\s*['"]([^'"]+)['"]/);  
const appIdMatch = configContent.match(/appId:\s*['"]([^'"]+)['"]/);  

if (!apiKeyMatch || !databaseURLMatch) {
  console.error('Failed to parse Firebase config');
  process.exit(1);
}

const firebaseConfig = {
  apiKey: apiKeyMatch[1],
  authDomain: authDomainMatch ? authDomainMatch[1] : '',
  databaseURL: databaseURLMatch[1],
  projectId: projectIdMatch ? projectIdMatch[1] : '',
  storageBucket: storageBucketMatch ? storageBucketMatch[1] : '',
  messagingSenderId: messagingSenderIdMatch ? messagingSenderIdMatch[1] : '',
  appId: appIdMatch ? appIdMatch[1] : ''
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function updateUnavailableFromReturns() {
  try {
    console.log('🔍 Scanning return history for Replace Product refunds...\n');

    // Get all returns
    const returnsSnapshot = await get(ref(db, 'return_goods'));
    
    if (!returnsSnapshot.exists()) {
      console.log('No returns found in database');
      return;
    }

    const returns = returnsSnapshot.val();
    
    // Track quantity unavailable per product
    const productUnavailableMap = {};
    
    // Scan all returns
    let replaceProductCount = 0;
    Object.entries(returns).forEach(([returnId, returnData]) => {
      // Only count resolved Replace Product returns
      if (returnData.refundMethod === 'replace_product' && returnData.status === 'resolved') {
        replaceProductCount++;
        
        console.log(`📦 Return ${returnData.returnNumber || returnId}:`);
        console.log(`   Status: ${returnData.status}`);
        console.log(`   Method: ${returnData.refundMethod}`);
        console.log(`   Processed: ${returnData.processedAt || 'N/A'}`);
        
        // Process each item in the return
        if (returnData.items && Array.isArray(returnData.items)) {
          returnData.items.forEach(item => {
            const productId = item.productId;
            const quantity = item.quantityReturned || item.quantity || 0;
            
            if (productId && quantity > 0) {
              if (!productUnavailableMap[productId]) {
                productUnavailableMap[productId] = {
                  productName: item.productName,
                  totalUnavailable: 0,
                  returns: []
                };
              }
              
              productUnavailableMap[productId].totalUnavailable += quantity;
              productUnavailableMap[productId].returns.push({
                returnId,
                returnNumber: returnData.returnNumber,
                quantity
              });
              
              console.log(`   - ${item.productName}: ${quantity} units`);
            }
          });
        }
        console.log('');
      }
    });

    console.log(`\n✅ Found ${replaceProductCount} resolved Replace Product returns\n`);
    console.log('=' .repeat(60));
    console.log('PRODUCT SUMMARY:');
    console.log('=' .repeat(60) + '\n');

    // Update each product
    for (const [productId, data] of Object.entries(productUnavailableMap)) {
      console.log(`📦 ${data.productName}`);
      console.log(`   Product ID: ${productId}`);
      console.log(`   Total Unavailable from Returns: ${data.totalUnavailable}`);
      console.log(`   Returns:`);
      data.returns.forEach(r => {
        console.log(`      - ${r.returnNumber || r.returnId}: ${r.quantity} units`);
      });

      // Get current product data
      const productSnapshot = await get(ref(db, `products/${productId}`));
      
      if (productSnapshot.exists()) {
        const product = productSnapshot.val();
        const currentQuantity = product.quantity || 0;
        const currentUnavailable = product.quantityUnavailable || 0;
        
        console.log(`   Current Stock: ${currentQuantity}`);
        console.log(`   Current Unavailable: ${currentUnavailable}`);
        console.log(`   New Unavailable: ${data.totalUnavailable}`);
        
        // Update the product
        await update(ref(db, `products/${productId}`), {
          quantityUnavailable: data.totalUnavailable,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`   ✅ Updated!\n`);
      } else {
        console.log(`   ⚠️  Product not found in database\n`);
      }
    }

    console.log('=' .repeat(60));
    console.log('✅ Update complete!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
updateUnavailableFromReturns();
