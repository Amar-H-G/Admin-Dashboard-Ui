// src/constants/index.js

export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const SORT_OPTIONS = [
  { value: '',        label: 'Default'       },
  { value: 'title',   label: 'Name'          },
  { value: 'price',   label: 'Price'         },
  { value: 'rating',  label: 'Rating'        },
  { value: 'stock',   label: 'Stock'         },
];

export const SORT_FIELD_OPTIONS = SORT_OPTIONS;

export const SORT_ORDER_OPTIONS = [
  { value: 'asc',  label: 'Ascending'  },
  { value: 'desc', label: 'Descending' },
];

export const DEFAULT_PRODUCT_IMAGE = 'https://dummyjson.com/image/400x300/cccccc/999999?text=No+Image';

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/products', icon: 'home'     },
  { label: 'Products',  path: '/products', icon: 'cube'     },
];
