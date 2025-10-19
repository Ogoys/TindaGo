/**
 * Products API
 *
 * Firebase operations for product data
 */

import { ref, get, query, orderByChild, equalTo, limitToFirst } from 'firebase/database';
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
 * Fetch products by category
 */
export async function fetchProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    const productsRef = ref(database, 'products');
    const categoryQuery = query(productsRef, orderByChild('categoryId'), equalTo(categoryId));
    const snapshot = await get(categoryQuery);

    if (snapshot.exists()) {
      const products = Object.values(snapshot.val()) as Product[];
      return products;
    }
    return [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

/**
 * Fetch best selling products
 */
export async function fetchBestSellingProducts(limit: number = 10): Promise<Product[]> {
  try {
    const productsRef = ref(database, 'products');
    const bestSellingQuery = query(productsRef, orderByChild('isBestSelling'), equalTo(true), limitToFirst(limit));
    const snapshot = await get(bestSellingQuery);

    if (snapshot.exists()) {
      return Object.values(snapshot.val()) as Product[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching best selling products:', error);
    return [];
  }
}

/**
 * Fetch popular picks
 */
export async function fetchPopularPicks(limit: number = 10): Promise<Product[]> {
  try {
    const productsRef = ref(database, 'products');
    const popularQuery = query(productsRef, orderByChild('isPopular'), equalTo(true), limitToFirst(limit));
    const snapshot = await get(popularQuery);

    if (snapshot.exists()) {
      return Object.values(snapshot.val()) as Product[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching popular picks:', error);
    return [];
  }
}

/**
 * Search products by name
 */
export async function searchProducts(searchQuery: string): Promise<Product[]> {
  try {
    const productsRef = ref(database, 'products');
    const snapshot = await get(productsRef);

    if (snapshot.exists()) {
      const allProducts = Object.values(snapshot.val()) as Product[];
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return filtered;
    }
    return [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

/**
 * Fetch all products with optional filtering
 */
export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const productsRef = ref(database, 'products');
    const snapshot = await get(productsRef);

    if (snapshot.exists()) {
      return Object.values(snapshot.val()) as Product[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

/**
 * Fetch products by store ID
 */
export async function fetchProductsByStore(storeId: string): Promise<Product[]> {
  try {
    const productsRef = ref(database, 'products');
    const storeProductsQuery = query(productsRef, orderByChild('storeId'), equalTo(storeId));
    const snapshot = await get(storeProductsQuery);

    if (snapshot.exists()) {
      const data = snapshot.val();
      // Map products with their IDs
      return Object.keys(data).map(productId => ({
        id: productId,
        ...data[productId]
      })) as Product[];
    }
    return [];
  } catch (error) {
    console.error('Error fetching products by store:', error);
    return [];
  }
}
