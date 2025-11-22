/**
 * Products API
 *
 * Firebase operations for product data
 */

import { ref, get } from 'firebase/database';
import { database } from '../../../FirebaseConfig';
import type { Product } from '@/models';

/**
 * Fetch a single product by ID
 */
export async function fetchProductById(productId: string): Promise<Product | null> {
  try {
    const productRef = ref(database, `products/${productId}`);
    const snapshot = await get(productRef);

    if (snapshot.exists()) {
      // Include the product ID in the returned object
      return {
        id: productId,
        ...snapshot.val()
      } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Fetch products by category (only available products for customers)
 * Uses one-time get() with client-side filtering (Phase 1 optimization)
 */
export async function fetchProductsByCategory(categoryId: string, includeOutOfStock: boolean = false): Promise<Product[]> {
  try {
    const productsRef = ref(database, 'products');
    const snapshot = await get(productsRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      // Map and filter by categoryId client-side
      const products = Object.keys(data)
        .map(id => ({ id, ...data[id] }))
        .filter(p => p.categoryId === categoryId) as Product[];
      
      // Filter out out-of-stock products unless explicitly requested
      return includeOutOfStock ? products : products.filter(p => p.status === 'available');
    }
    return [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

/**
 * Fetch best selling products (only available products for customers)
 * Uses one-time get() with client-side filtering (Phase 1 optimization)
 */
export async function fetchBestSellingProducts(limit: number = 10): Promise<Product[]> {
  try {
    const productsRef = ref(database, 'products');
    const snapshot = await get(productsRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      // Map and filter for best selling products client-side
      const allProducts = Object.keys(data)
        .map(id => ({ id, ...data[id] }))
        .filter(p => p.isBestSelling === true && p.status === 'available') as Product[];
      
      // Apply limit client-side
      return allProducts.slice(0, limit);
    }
    return [];
  } catch (error) {
    console.error('Error fetching best selling products:', error);
    return [];
  }
}

/**
 * Fetch popular picks (only available products for customers)
 * Uses one-time get() with client-side filtering (Phase 1 optimization)
 */
export async function fetchPopularPicks(limit: number = 10): Promise<Product[]> {
  try {
    const productsRef = ref(database, 'products');
    const snapshot = await get(productsRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      // Map and filter for popular products client-side
      const allProducts = Object.keys(data)
        .map(id => ({ id, ...data[id] }))
        .filter(p => p.isPopular === true && p.status === 'available') as Product[];
      
      // Apply limit client-side
      return allProducts.slice(0, limit);
    }
    return [];
  } catch (error) {
    console.error('Error fetching popular picks:', error);
    return [];
  }
}

/**
 * Search products by name (only available products for customers)
 */
export async function searchProducts(searchQuery: string, includeOutOfStock: boolean = false): Promise<Product[]> {
  try {
    const productsRef = ref(database, 'products');
    const snapshot = await get(productsRef);

    if (snapshot.exists()) {
      const allProducts = Object.values(snapshot.val()) as Product[];
      const filtered = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());
        const isAvailable = includeOutOfStock || product.status === 'available';
        return matchesSearch && isAvailable;
      });
      return filtered;
    }
    return [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

/**
 * Fetch all products with optional filtering (only available products for customers by default)
 */
export async function fetchAllProducts(includeOutOfStock: boolean = false): Promise<Product[]> {
  try {
    const productsRef = ref(database, 'products');
    const snapshot = await get(productsRef);

    if (snapshot.exists()) {
      const allProducts = Object.values(snapshot.val()) as Product[];
      // Filter to only show available products unless explicitly requested
      return includeOutOfStock ? allProducts : allProducts.filter(p => p.status === 'available');
    }
    return [];
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

/**
 * Fetch products by store ID (only available products for customers by default)
 * Uses one-time get() with client-side filtering (Phase 1 optimization)
 */
export async function fetchProductsByStore(storeId: string, includeOutOfStock: boolean = false): Promise<Product[]> {
  try {
    // Fetch all products once (no index required)
    const productsRef = ref(database, 'products');
    const snapshot = await get(productsRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      // Map products with their IDs and filter by storeId OR storeOwnerId client-side
      // Some products may use storeOwnerId instead of storeId
      const allProducts = Object.keys(data)
        .map(productId => ({
          id: productId,
          ...data[productId]
        }))
        .filter(product => product.storeId === storeId || product.storeOwnerId === storeId) as Product[];
      
      // Filter to only show available products unless explicitly requested
      // Also filter out products with quantity <= 0
      const filtered = includeOutOfStock ? allProducts : allProducts.filter(p => p.status === 'available' && ((p.quantity && p.quantity > 0) || p.stock > 0));
      
      console.log(`📦 Fetched ${filtered.length} products for store ${storeId}`);
      return filtered;
    }
    return [];
  } catch (error) {
    console.error('Error fetching products by store:', error);
    return [];
  }
}
