// src/pages/Products/ProductFormPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProductById, addProduct, updateProduct } from '../../api/productApi';
import { useCategories } from '../../hooks/useCategories';
import { validateProductForm } from '../../utils/validators';
import { slugToLabel } from '../../utils/formatters';
import {
  saveCreatedProduct,
  saveUpdatedProduct,
  getLocalProduct,
  applyLocalOverridesToProduct,
  isProductDeleted,
  isCreatedProduct,
} from '../../utils/localProductStorage';

import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import ProductImage from '../../components/common/ProductImage';
import FormSkeleton from '../../components/skeletons/FormSkeleton';
import ErrorState from '../../components/feedback/ErrorState';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { categories, isLoading: isCategoriesLoading } = useCategories();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    stock: '',
    brand: '',
    rating: '',
    description: '',
    thumbnail: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [fetchError, setFetchError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch product data in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    if (isProductDeleted(id)) {
      setFetchError('This product has been deleted.');
      setIsFetching(false);
      return;
    }

    // Check if product exists in local storage (created or updated)
    const local = getLocalProduct(id);
    if (local) {
      setFormData({
        title: local.title || '',
        category: local.category || '',
        price: local.price !== undefined ? String(local.price) : '',
        stock: local.stock !== undefined ? String(local.stock) : '',
        brand: local.brand || '',
        rating: local.rating !== undefined ? String(local.rating) : '',
        description: local.description || '',
        thumbnail: local.thumbnail || local.images?.[0] || '',
      });
      setIsFetching(false);
      return;
    }

    const controller = new AbortController();
    setIsFetching(true);
    setFetchError(null);

    fetchProductById(id, { signal: controller.signal })
      .then((data) => {
        const product = applyLocalOverridesToProduct(data);
        if (!product) {
          setFetchError('Product not found.');
          return;
        }
        setFormData({
          title: product.title || '',
          category: product.category || '',
          price: product.price !== undefined ? String(product.price) : '',
          stock: product.stock !== undefined ? String(product.stock) : '',
          brand: product.brand || '',
          rating: product.rating !== undefined ? String(product.rating) : '',
          description: product.description || '',
          thumbnail: product.thumbnail || product.images?.[0] || '',
        });
      })
      .catch((err) => {
        if (err.name === 'AbortError' || err.message === 'canceled') return;
        setFetchError(err.message || 'Failed to fetch product details.');
      })
      .finally(() => {
        setIsFetching(false);
      });

    return () => controller.abort();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation if field was touched
    if (touched[name]) {
      const fieldErrors = validateProductForm({ ...formData, [name]: value });
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldErrors = validateProductForm(formData);
    setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Mark all touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    const validationErrors = validateProductForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      brand: formData.brand.trim() || undefined,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      description: formData.description.trim(),
      thumbnail: formData.thumbnail.trim() || undefined,
    };

    try {
      if (isEditMode) {
        let updatedResponse = null;
        try {
          updatedResponse = await updateProduct(id, payload);
        } catch (apiErr) {
          // If the product was locally created (e.g. ID >= 195), DummyJSON doesn't have it on the server
          // and returns a 404. We catch this expected 404 and allow the local update to proceed.
          const isLocal = isCreatedProduct(id);
          const is404 = apiErr?.status === 404 || apiErr?.message?.toLowerCase().includes('not found');
          if (!isLocal || !is404) {
            throw apiErr;
          }
        }

        saveUpdatedProduct({
          id,
          ...payload,
          ...(updatedResponse || {}),
        });
        toast.success(`Product "${payload.title}" updated successfully!`);
        navigate(`/products/${id}`);
      } else {
        let createdResponse = null;
        try {
          createdResponse = await addProduct(payload);
        } catch (apiErr) {
          console.warn('DummyJSON addProduct network call failed, saving locally:', apiErr);
        }
        const createdProduct = {
          ...payload,
          ...(createdResponse || {}),
        };
        const saved = saveCreatedProduct(createdProduct);
        toast.success(`Product "${saved?.title || payload.title}" added successfully!`);
        navigate('/products');
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <FormSkeleton fields={6} />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center space-y-4">
        <ErrorState
          title="Could not load product"
          message={fetchError}
          onRetry={() => window.location.reload()}
        />
        <Link to="/products">
          <Button variant="secondary">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const categoryOptions = [
    { value: '', label: '-- Select a Category --' },
    ...categories.map((cat) => {
      if (typeof cat === 'object' && cat !== null) {
        return { value: cat.slug, label: cat.name || slugToLabel(cat.slug) };
      }
      return { value: String(cat), label: slugToLabel(String(cat)) };
    }),
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/products" className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Products
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">
          {isEditMode ? `Edit Product #${id}` : 'Create New Product'}
        </span>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="border-b border-slate-100 pb-5 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {isEditMode ? 'Edit Product Details' : 'Add New Product to Inventory'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isEditMode
              ? 'Update the product specifications, pricing, and media assets below.'
              : 'Fill in the information to publish a new product in the admin catalogue.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Title */}
          <Input
            id="product-title"
            label="Product Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.title ? errors.title : undefined}
            placeholder="e.g. Wireless Noise-Cancelling Headphones"
            required
          />

          {/* Category & Brand row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="product-category"
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              onBlur={handleBlur}
              options={categoryOptions}
              error={touched.category ? errors.category : undefined}
              required
              disabled={isCategoriesLoading}
            />

            <Input
              id="product-brand"
              label="Brand (Optional)"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Sony, Apple, Samsung"
            />
          </div>

          {/* Price, Stock & Rating row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="product-price"
              label="Price ($)"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.price ? errors.price : undefined}
              placeholder="0.00"
              required
            />

            <Input
              id="product-stock"
              label="Stock Quantity"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.stock ? errors.stock : undefined}
              placeholder="0"
              required
            />

            <Input
              id="product-rating"
              label="Rating (0 – 5)"
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.rating}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.rating ? errors.rating : undefined}
              placeholder="4.5"
            />
          </div>

          {/* Image Thumbnail URL + Live Preview */}
          <div className="space-y-2">
            <Input
              id="product-thumbnail"
              label="Image URL (Optional)"
              name="thumbnail"
              type="url"
              value={formData.thumbnail}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="https://images.example.com/product.jpg"
              helperText="Paste a direct public image link to display product thumbnail."
            />

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-14 h-14 rounded-lg bg-white overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                <ProductImage
                  src={formData.thumbnail}
                  title={formData.title || 'Product'}
                  textClassName="text-xl font-bold"
                />
              </div>
              <div className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700 block">
                  {formData.thumbnail ? 'Image Preview' : 'Fallback Avatar Preview'}
                </span>
                <span>
                  {formData.thumbnail
                    ? 'Will be displayed in product cards and inventory listings'
                    : 'If no image is provided, the first character of the product title is displayed'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <Textarea
            id="product-description"
            label="Product Description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.description ? errors.description : undefined}
            placeholder="Provide a detailed description of features, materials, and specifications..."
            required
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={
                !isSubmitting && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )
              }
            >
              {isSubmitting
                ? isEditMode
                  ? 'Saving Changes...'
                  : 'Creating Product...'
                : isEditMode
                ? 'Save Changes'
                : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
