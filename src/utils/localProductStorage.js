// src/utils/localProductStorage.js
// Centralized client-side persistence layer for DummyJSON product mutations (Add, Edit, Delete).
// DummyJSON endpoints simulate mutations but do not persist changes permanently on their backend.
// This utility ensures local created/updated/deleted products survive page reloads and participate
// in catalog viewing, search, category filtering, sorting, pagination, and details views.

const STORAGE_KEYS = {
  CREATED: 'admincore_created_products_v1',
  UPDATED: 'admincore_updated_products_v1',
  DELETED: 'admincore_deleted_product_ids_v1',
};

/**
 * Safely parse JSON from localStorage with fallback.
 */
function safeGet(key, fallback) {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`[localProductStorage] Failed to read "${key}" from localStorage:`, err);
    return fallback;
  }
}

/**
 * Safely save data to localStorage.
 */
function safeSet(key, value) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[localProductStorage] Failed to save "${key}" to localStorage:`, err);
  }
}

// -------------------------------------------------------------
// 1. Created Products
// -------------------------------------------------------------

/**
 * Returns an array of products created locally.
 * Newest products are at the front.
 */
export function getCreatedProducts() {
  const items = safeGet(STORAGE_KEYS.CREATED, []);
  return Array.isArray(items) ? items : [];
}

/**
 * Saves a newly created product (returned from DummyJSON POST /products/add).
 * Ensures it has an ID, full fields for display, and is prepended to the created list.
 */
export function saveCreatedProduct(product) {
  if (!product) return;
  const current = getCreatedProducts();
  // Ensure numeric/string ID stability
  const normalizedId = product.id ?? Date.now();
  const fullProduct = {
    ...product,
    id: normalizedId,
    rating: product.rating ?? 5.0,
    reviews: product.reviews || [],
    images: product.images && product.images.length > 0
      ? product.images
      : (product.thumbnail ? [product.thumbnail] : []),
    thumbnail: product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/300?text=Product',
    createdAt: product.createdAt || new Date().toISOString(),
  };

  // Remove duplicate if somehow already exists
  const filtered = current.filter((p) => String(p.id) !== String(normalizedId));
  safeSet(STORAGE_KEYS.CREATED, [fullProduct, ...filtered]);
  return fullProduct;
}

// -------------------------------------------------------------
// 2. Updated Products
// -------------------------------------------------------------

/**
 * Returns a map of { [productId]: updatedProductData }
 */
export function getUpdatedProducts() {
  const map = safeGet(STORAGE_KEYS.UPDATED, {});
  return typeof map === 'object' && map !== null && !Array.isArray(map) ? map : {};
}

/**
 * Saves updated product data (returned from DummyJSON PUT /products/:id).
 * If the product was locally created, updates it in the created list as well.
 */
export function saveUpdatedProduct(product) {
  if (!product || product.id === undefined) return;
  const idStr = String(product.id);

  // Update in UPDATED map
  const updatedMap = getUpdatedProducts();
  const existingOverride = updatedMap[idStr] || {};
  updatedMap[idStr] = {
    ...existingOverride,
    ...product,
    updatedAt: new Date().toISOString(),
  };
  safeSet(STORAGE_KEYS.UPDATED, updatedMap);

  // If this product is also in CREATED products, update it in-place
  const createdList = getCreatedProducts();
  const createdIndex = createdList.findIndex((p) => String(p.id) === idStr);
  if (createdIndex !== -1) {
    createdList[createdIndex] = {
      ...createdList[createdIndex],
      ...product,
    };
    safeSet(STORAGE_KEYS.CREATED, createdList);
  }
}

// -------------------------------------------------------------
// 3. Deleted Product IDs
// -------------------------------------------------------------

/**
 * Returns an array of deleted product IDs (strings).
 */
export function getDeletedProductIds() {
  const ids = safeGet(STORAGE_KEYS.DELETED, []);
  return Array.isArray(ids) ? ids.map(String) : [];
}

/**
 * Marks a product as deleted.
 * Adds ID to deleted list and cleans it up from created and updated storage.
 */
export function markProductDeleted(id) {
  if (id === undefined || id === null) return;
  const idStr = String(id);

  // Add to deleted IDs set
  const deletedSet = new Set(getDeletedProductIds());
  deletedSet.add(idStr);
  safeSet(STORAGE_KEYS.DELETED, Array.from(deletedSet));

  // Remove from created products if present
  const created = getCreatedProducts().filter((p) => String(p.id) !== idStr);
  safeSet(STORAGE_KEYS.CREATED, created);

  // Remove from updated products if present
  const updated = getUpdatedProducts();
  if (updated[idStr]) {
    delete updated[idStr];
    safeSet(STORAGE_KEYS.UPDATED, updated);
  }
}

/**
 * Checks if a product ID has been marked as deleted.
 */
export function isProductDeleted(id) {
  if (id === undefined || id === null) return false;
  const deletedSet = new Set(getDeletedProductIds());
  return deletedSet.has(String(id));
}

// -------------------------------------------------------------
// 4. Single Product Resolution (For Details & Edit pages)
// -------------------------------------------------------------

/**
 * Resolves product data from local storage if available.
 * Returns:
 * - null if product is deleted
 * - product object if found in created or updated
 * - undefined if no local data exists (caller should fetch from server)
 */
export function getLocalProduct(id) {
  if (isProductDeleted(id)) {
    return null; // explicitly deleted
  }

  const idStr = String(id);

  // Check created products first
  const created = getCreatedProducts().find((p) => String(p.id) === idStr);
  if (created) {
    const updatedMap = getUpdatedProducts();
    return updatedMap[idStr] ? { ...created, ...updatedMap[idStr] } : created;
  }

  // Check if server product has an update override
  const updatedMap = getUpdatedProducts();
  if (updatedMap[idStr]) {
    return updatedMap[idStr];
  }

  return undefined; // Not in local storage, needs server fetch
}

/**
 * Applies local update overrides to a server-fetched product.
 */
export function applyLocalOverridesToProduct(serverProduct) {
  if (!serverProduct || serverProduct.id === undefined) return serverProduct;
  const idStr = String(serverProduct.id);

  if (isProductDeleted(idStr)) {
    return null;
  }

  const updatedMap = getUpdatedProducts();
  if (updatedMap[idStr]) {
    return {
      ...serverProduct,
      ...updatedMap[idStr],
    };
  }

  return serverProduct;
}

// -------------------------------------------------------------
// 5. Server + Local Mutation Merging
// -------------------------------------------------------------

/**
 * Merges server products with local created, updated, and deleted products.
 *
 * Rules:
 * 1. Filter out all products matching deleted IDs.
 * 2. Apply any updated fields from getUpdatedProducts() to matching server products.
 * 3. Prepend newly created products (so they appear at the top).
 *
 * @param {Array} serverProducts - Raw products array from DummyJSON
 * @returns {Array} Complete merged product list
 */
export function mergeProductsWithLocalMutations(serverProducts = []) {
  const deletedSet = new Set(getDeletedProductIds());
  const updatedMap = getUpdatedProducts();
  const createdList = getCreatedProducts();

  // 1. Filter and update server products
  const activeServerProducts = serverProducts
    .filter((p) => !deletedSet.has(String(p.id)))
    .map((p) => {
      const idStr = String(p.id);
      if (updatedMap[idStr]) {
        return { ...p, ...updatedMap[idStr] };
      }
      return p;
    });

  // 2. Active created products (not deleted, with any updates applied)
  const activeCreatedProducts = createdList
    .filter((p) => !deletedSet.has(String(p.id)))
    .map((p) => {
      const idStr = String(p.id);
      if (updatedMap[idStr]) {
        return { ...p, ...updatedMap[idStr] };
      }
      return p;
    });

  // Prevent duplicate IDs if a created product has same ID as server product
  const createdIds = new Set(activeCreatedProducts.map((p) => String(p.id)));
  const nonDuplicateServerProducts = activeServerProducts.filter(
    (p) => !createdIds.has(String(p.id))
  );

  // Prepend created products so newest listings appear first
  return [...activeCreatedProducts, ...nonDuplicateServerProducts];
}

// -------------------------------------------------------------
// 6. Reset / Testing Utility
// -------------------------------------------------------------

/**
 * Clears all local mutation data from localStorage.
 */
export function clearLocalProductData() {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CREATED);
    localStorage.removeItem(STORAGE_KEYS.UPDATED);
    localStorage.removeItem(STORAGE_KEYS.DELETED);
  } catch (err) {
    console.warn('[localProductStorage] Failed to clear localStorage:', err);
  }
}
