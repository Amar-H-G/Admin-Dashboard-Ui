// src/utils/validators.js

export function validateProductForm(values) {
  const errors = {};

  if (!values.title || values.title.trim().length < 2) {
    errors.title = 'Title must be at least 2 characters.';
  }
  if (values.title && values.title.length > 100) {
    errors.title = 'Title must be 100 characters or fewer.';
  }

  if (!values.description || values.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters.';
  }

  const price = parseFloat(values.price);
  if (!values.price && values.price !== 0) {
    errors.price = 'Price is required.';
  } else if (isNaN(price) || price <= 0) {
    errors.price = 'Price must be a positive number.';
  } else if (price > 1000000) {
    errors.price = 'Price seems unreasonably high.';
  }

  const stock = parseInt(values.stock, 10);
  if (!values.stock && values.stock !== 0) {
    errors.stock = 'Stock is required.';
  } else if (isNaN(stock) || stock < 0) {
    errors.stock = 'Stock must be zero or a positive integer.';
  }

  if (!values.category || values.category.trim() === '') {
    errors.category = 'Category is required.';
  }

  const rating = parseFloat(values.rating);
  if (values.rating !== '' && values.rating !== undefined) {
    if (isNaN(rating) || rating < 0 || rating > 5) {
      errors.rating = 'Rating must be between 0 and 5.';
    }
  }

  return errors;
}

export function validateLoginForm(values) {
  const errors = {};
  if (!values.username || values.username.trim() === '') {
    errors.username = 'Username is required.';
  }
  if (!values.password || values.password.trim() === '') {
    errors.password = 'Password is required.';
  }
  return errors;
}
