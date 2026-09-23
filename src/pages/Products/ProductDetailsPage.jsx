import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProductById, deleteProduct } from '../../api/productApi';
import ProductDetailsSkeleton from '../../components/skeletons/ProductDetailsSkeleton';
import ErrorState from '../../components/feedback/ErrorState';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import StarRating from '../../components/common/StarRating';
import DeleteConfirmModal from '../../components/products/DeleteConfirmModal';
import { formatCurrency, formatStock, slugToLabel } from '../../utils/formatters';
import {
  getLocalProduct,
  applyLocalOverridesToProduct,
  isProductDeleted,
  markProductDeleted,
} from '../../utils/localProductStorage';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Explicit lifecycle status: 'loading' | 'success' | 'not-found' | 'error'
  const [status, setStatus] = useState('loading');
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProduct = useCallback(async (signal) => {
    // 1. Check if explicitly deleted
    if (isProductDeleted(id)) {
      setStatus('not-found');
      setErrorMessage('This product has been deleted.');
      setProduct(null);
      return;
    }

    // 2. Validate ID format: positive integer
    const numericId = Number(id);
    if (!id || isNaN(numericId) || numericId <= 0 || !Number.isInteger(numericId)) {
      setStatus('not-found');
      setErrorMessage('The requested product could not be found.');
      setProduct(null);
      return;
    }

    // 3. Check if available in local storage (created or updated)
    const local = getLocalProduct(id);
    if (local) {
      setProduct(local);
      setSelectedImage(local.thumbnail || local.images?.[0] || null);
      setStatus('success');
      return;
    }

    setStatus('loading');
    setProduct(null);
    setErrorMessage(null);

    try {
      const data = await fetchProductById(id, { signal });
      if (signal?.aborted) return;

      const finalProduct = applyLocalOverridesToProduct(data);

      if (!finalProduct || !finalProduct.id) {
        setStatus('not-found');
        setErrorMessage('The requested product could not be found.');
      } else {
        setProduct(finalProduct);
        setSelectedImage(finalProduct.thumbnail || finalProduct.images?.[0] || null);
        setStatus('success');
      }
    } catch (err) {
      if (
        signal?.aborted ||
        err.name === 'AbortError' ||
        err.name === 'CanceledError' ||
        err.code === 'ERR_CANCELED' ||
        err.message === 'canceled'
      ) {
        // Aborted request (route transition or React StrictMode cleanup) — do not update state
        return;
      }

      if (
        err.status === 404 ||
        err.message?.toLowerCase().includes('not found')
      ) {
        setStatus('not-found');
        setErrorMessage(err.message || 'The requested product could not be found.');
      } else {
        setStatus('error');
        setErrorMessage(err.message || 'Failed to load product details.');
      }
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    loadProduct(controller.signal);
    return () => controller.abort();
  }, [loadProduct]);

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteProduct(id);
      markProductDeleted(id);
      toast.success('Product deleted successfully');
      navigate('/products', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // 1. Initial / In-flight loading -> Show skeleton
  if (status === 'loading') {
    return <ProductDetailsSkeleton />;
  }

  // 2. Confirmed Not Found (e.g. 404 or invalid ID) -> Show Not Found UI
  if (status === 'not-found') {
    return (
      <div className="py-8">
        <ErrorState
          title="Product not found"
          message={errorMessage || 'The requested product could not be found.'}
          onRetry={() => loadProduct()}
        />
        <div className="mt-4 text-center">
          <Link to="/products">
            <Button variant="secondary">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Network or Server Error -> Show Error UI with Retry
  if (status === 'error') {
    return (
      <div className="py-8">
        <ErrorState
          title="Failed to load product"
          message={errorMessage || 'A network error occurred while loading this product. Please check your connection and try again.'}
          onRetry={() => loadProduct()}
        />
        <div className="mt-4 text-center">
          <Link to="/products">
            <Button variant="secondary">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 4. Fallback guard
  if (!product) {
    return <ProductDetailsSkeleton />;
  }

  const stockInfo = formatStock(product.stock ?? 0);
  const originalPrice = product.discountPercentage
    ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2)
    : null;

  return (
    <div className="space-y-6">
      {/* Top breadcrumb & Actions header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/products" className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Products
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold truncate max-w-xs">{product.title}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to={`/products/${id}/edit`}>
            <Button
              variant="secondary"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            >
              Edit Product
            </Button>
          </Link>

          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main product overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        {/* Left column: Image gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-4/3 w-full bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden flex items-center justify-center p-4">
            <img
              src={selectedImage || 'https://via.placeholder.com/600x400?text=No+Image'}
              alt={product.title}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/600x400?text=No+Image';
              }}
            />
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 cursor-pointer transition-all ${
                    selectedImage === img
                      ? 'border-blue-600 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Details */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{slugToLabel(product.category)}</Badge>
              {product.brand && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  Brand: {product.brand}
                </span>
              )}
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${stockInfo.color} border-current/20`}>
                {stockInfo.label}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {product.title}
            </h1>

            <div className="flex items-center gap-3">
              <StarRating rating={product.rating || 0} size="md" />
              <span className="text-sm text-slate-500">
                ({product.rating?.toFixed(1) || '0.0'} / 5.0 · {product.reviews?.length || 0} customer reviews)
              </span>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900">
                {formatCurrency(product.price)}
              </span>
              {originalPrice && (
                <span className="text-base text-slate-400 line-through">
                  ${originalPrice}
                </span>
              )}
              {product.discountPercentage > 0 && (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                  {Math.round(product.discountPercentage)}% OFF
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Description
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>

          {/* Product Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-medium">SKU</span>
              <span className="font-semibold text-slate-800">{product.sku || `PRD-${product.id}`}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Stock Count</span>
              <span className="font-semibold text-slate-800">{product.stock ?? 'N/A'} units</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Min Order Qty</span>
              <span className="font-semibold text-slate-800">{product.minimumOrderQuantity || 1}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Warranty</span>
              <span className="font-semibold text-slate-800">{product.warrantyInformation || '1 Month'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Shipping</span>
              <span className="font-semibold text-slate-800">{product.shippingInformation || 'Standard Shipping'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Return Policy</span>
              <span className="font-semibold text-slate-800">{product.returnPolicy || '30 days return'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Verified Customer Reviews ({product.reviews.length})
            </h2>
            <StarRating rating={product.rating || 0} size="sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {product.reviews.map((rev, index) => (
              <div key={index} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-sm">{rev.reviewerName}</span>
                  <StarRating rating={rev.rating} size="xs" />
                </div>
                <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>
                <div className="text-[11px] text-slate-400">
                  {new Date(rev.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        product={product}
        isDeleting={isDeleting}
      />
    </div>
  );
}
