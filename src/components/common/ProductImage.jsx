// src/components/common/ProductImage.jsx
// Displays a product image with automatic fallback to the first character of the product's title
// if the image is missing, empty, or fails to load.

import { useState, useEffect } from 'react';

const GRADIENTS = [
  'from-blue-600 to-indigo-700',
  'from-violet-600 to-purple-700',
  'from-emerald-600 to-teal-700',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-600 to-blue-700',
  'from-indigo-600 to-fuchsia-700',
  'from-teal-600 to-emerald-700',
];

export default function ProductImage({
  src,
  title = '',
  alt,
  className = 'w-full h-full object-cover object-center',
  textClassName = 'text-base font-bold',
  containerClassName = '',
}) {
  const [hasError, setHasError] = useState(false);

  // Reset error state if the src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const cleanTitle = (title || alt || '').trim();
  const initial = cleanTitle ? cleanTitle.charAt(0).toUpperCase() : '?';

  // Deterministic gradient selection based on character code
  const charCode = initial.charCodeAt(0) || 0;
  const gradient = GRADIENTS[charCode % GRADIENTS.length];

  const isMissing = !src || typeof src !== 'string' || src.trim() === '' || src.includes('placeholder.com');

  if (isMissing || hasError) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradient} text-white select-none shadow-inner ${containerClassName}`}
        aria-label={cleanTitle || 'Product image fallback'}
        title={cleanTitle}
      >
        <span className={`tracking-wider drop-shadow-sm select-none ${textClassName}`}>
          {initial}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || cleanTitle}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
