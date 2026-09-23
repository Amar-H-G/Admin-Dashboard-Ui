// src/__tests__/unit.test.js
import test from 'node:test';
import assert from 'node:assert/strict';

import { validateProductForm, validateLoginForm } from '../utils/validators.js';
import {
  formatCurrency,
  formatRating,
  formatStock,
  truncate,
  capitalize,
  slugToLabel,
} from '../utils/formatters.js';

test('validateLoginForm tests', async (t) => {
  await t.test('returns errors when fields are empty', () => {
    const errors = validateLoginForm({ username: '', password: '' });
    assert.equal(errors.username, 'Username is required.');
    assert.equal(errors.password, 'Password is required.');
  });

  await t.test('passes when valid credentials provided', () => {
    const errors = validateLoginForm({ username: 'emilys', password: 'emilyspass' });
    assert.equal(Object.keys(errors).length, 0);
  });
});

test('validateProductForm tests', async (t) => {
  await t.test('catches short title and short description', () => {
    const errors = validateProductForm({
      title: 'a',
      description: 'short',
      price: '',
      stock: '',
      category: '',
    });
    assert.equal(errors.title, 'Title must be at least 2 characters.');
    assert.equal(errors.description, 'Description must be at least 10 characters.');
    assert.equal(errors.price, 'Price is required.');
    assert.equal(errors.stock, 'Stock is required.');
    assert.equal(errors.category, 'Category is required.');
  });

  await t.test('catches negative price and negative stock', () => {
    const errors = validateProductForm({
      title: 'Valid Title',
      description: 'This is a sufficiently long valid description.',
      price: -10,
      stock: -5,
      category: 'smartphones',
    });
    assert.equal(errors.price, 'Price must be a positive number.');
    assert.equal(errors.stock, 'Stock must be zero or a positive integer.');
  });

  await t.test('catches rating out of bounds', () => {
    const errors = validateProductForm({
      title: 'Valid Title',
      description: 'This is a sufficiently long valid description.',
      price: 99.99,
      stock: 10,
      category: 'smartphones',
      rating: 6.5,
    });
    assert.equal(errors.rating, 'Rating must be between 0 and 5.');
  });

  await t.test('passes valid product values', () => {
    const errors = validateProductForm({
      title: 'Ergonomic Wireless Mouse',
      description: 'High precision wireless mouse with rechargeable battery.',
      price: 49.99,
      stock: 15,
      category: 'laptops',
      rating: 4.8,
    });
    assert.deepEqual(errors, {});
  });
});

test('Formatters unit tests', async (t) => {
  await t.test('formatCurrency formats USD amounts correctly', () => {
    assert.equal(formatCurrency(29.99), '$29.99');
    assert.equal(formatCurrency(0), '$0.00');
    assert.equal(formatCurrency(1250), '$1,250.00');
  });

  await t.test('formatRating rounds to 1 decimal place', () => {
    assert.equal(formatRating(4.567), '4.6');
    assert.equal(formatRating(5), '5.0');
  });

  await t.test('formatStock returns proper badges for 0, low, and in-stock', () => {
    const out = formatStock(0);
    assert.equal(out.label, 'Out of Stock');

    const low = formatStock(5);
    assert.equal(low.label, 'Low (5)');

    const inStock = formatStock(50);
    assert.equal(inStock.label, '50 in stock');
  });

  await t.test('truncate truncates strings properly with ellipsis', () => {
    assert.equal(truncate('Short', 10), 'Short');
    assert.equal(truncate('Hello World this is long', 11), 'Hello World…');
  });

  await t.test('capitalize capitalizes first character', () => {
    assert.equal(capitalize('smartphones'), 'Smartphones');
    assert.equal(capitalize(''), '');
  });

  await t.test('slugToLabel converts hyphenated slug to title case', () => {
    assert.equal(slugToLabel('home-decoration'), 'Home Decoration');
    assert.equal(slugToLabel('mens-watches'), 'Mens Watches');
  });
});

test('Pagination bounds calculation logic', async (t) => {
  const calculateRange = (page, limit, total) => {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const validPage = Math.min(Math.max(1, page), totalPages);
    const start = total === 0 ? 0 : Math.min((validPage - 1) * limit + 1, total);
    const end = Math.min(validPage * limit, total);
    return { totalPages, validPage, start, end };
  };

  await t.test('handles standard page 1', () => {
    const res = calculateRange(1, 10, 100);
    assert.equal(res.totalPages, 10);
    assert.equal(res.start, 1);
    assert.equal(res.end, 10);
  });

  await t.test('handles middle page', () => {
    const res = calculateRange(3, 10, 95);
    assert.equal(res.totalPages, 10);
    assert.equal(res.start, 21);
    assert.equal(res.end, 30);
  });

  await t.test('handles last page with partial count', () => {
    const res = calculateRange(10, 10, 95);
    assert.equal(res.totalPages, 10);
    assert.equal(res.start, 91);
    assert.equal(res.end, 95);
  });

  await t.test('handles empty results (total = 0)', () => {
    const res = calculateRange(1, 10, 0);
    assert.equal(res.totalPages, 1);
    assert.equal(res.start, 0);
    assert.equal(res.end, 0);
  });

  await t.test('safely clamps out-of-bounds page (page = 999)', () => {
    const res = calculateRange(999, 10, 50);
    assert.equal(res.validPage, 5);
    assert.equal(res.start, 41);
    assert.equal(res.end, 50);
  });

  await t.test('safely clamps negative page (page = -5)', () => {
    const res = calculateRange(-5, 10, 50);
    assert.equal(res.validPage, 1);
    assert.equal(res.start, 1);
    assert.equal(res.end, 10);
  });
});
