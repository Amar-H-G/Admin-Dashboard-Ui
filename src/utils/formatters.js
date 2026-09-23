// src/utils/formatters.js

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatRating(rating) {
  return Number(rating).toFixed(1);
}

export function formatStock(stock) {
  if (stock === 0) return { label: 'Out of Stock', color: 'text-red-600 bg-red-50' };
  if (stock < 10)  return { label: `Low (${stock})`, color: 'text-amber-600 bg-amber-50' };
  return { label: `${stock} in stock`, color: 'text-emerald-700 bg-emerald-50' };
}

export function truncate(str, maxLength = 60) {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength) + '…' : str;
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugToLabel(slug) {
  if (!slug) return '';
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
