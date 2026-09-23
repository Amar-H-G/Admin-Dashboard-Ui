import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUrlState } from '../../hooks/useUrlState';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { deleteProduct } from '../../api/productApi';
import { markProductDeleted, isCreatedProduct } from '../../utils/localProductStorage';

import ProductToolbar from '../../components/products/ProductToolbar';
import ProductTable from '../../components/products/ProductTable';
import ProductCard from '../../components/products/ProductCard';
import Pagination from '../../components/products/Pagination';
import DeleteConfirmModal from '../../components/products/DeleteConfirmModal';
import ProductTableSkeleton from '../../components/skeletons/ProductTableSkeleton';
import EmptyState from '../../components/feedback/EmptyState';
import ErrorState from '../../components/feedback/ErrorState';
import Button from '../../components/common/Button';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function ProductsPage() {
  useDocumentTitle('Products Catalog');
  const {
    page,
    limit,
    search,
    category,
    sortBy,
    sortOrder,
    setPage,
    setLimit,
    setSearch,
    setCategory,
    setSort,
    resetFilters,
  } = useUrlState();

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('dashboard_view_mode') || 'table';
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('dashboard_view_mode', mode);
  };

  const { products, total, isLoading, error, refetch } = useProducts({
    page,
    limit,
    search,
    category,
    sortBy,
    sortOrder,
  });

  const { categories } = useCategories();

  // Deletion modal state
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedIds, setDeletedIds] = useState(new Set());

  const handleOpenDelete = (product) => {
    setProductToDelete(product);
  };

  const handleCloseDelete = () => {
    if (!isDeleting) {
      setProductToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      try {
        await deleteProduct(productToDelete.id);
      } catch (apiErr) {
        const isLocal = isCreatedProduct(productToDelete.id);
        const is404 = apiErr?.status === 404 || apiErr?.message?.toLowerCase().includes('not found');
        if (!isLocal || !is404) {
          throw apiErr;
        }
      }
      markProductDeleted(productToDelete.id);
      setDeletedIds((prev) => new Set(prev).add(productToDelete.id));
      toast.success(`"${productToDelete.title}" deleted successfully`);
      setProductToDelete(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const visibleProducts = products.filter((p) => !deletedIds.has(p.id));

  const handleResetFilters = () => {
    resetFilters();
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your inventory, inspect product performance, and create listings.
          </p>
        </div>
        <Link to="/products/new">
          <Button
            variant="primary"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            }
          >
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Filter / Search Toolbar */}
      <ProductToolbar
        search={search}
        category={category}
        sortBy={sortBy}
        sortOrder={sortOrder}
        categories={categories}
        viewMode={viewMode}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onSortChange={setSort}
        onViewModeChange={handleViewModeChange}
        onResetFilters={handleResetFilters}
      />

      {/* Main Content Viewport */}
      {isLoading ? (
        <ProductTableSkeleton rows={limit > 10 ? 10 : limit} />
      ) : error ? (
        <ErrorState
          title="Could not load products"
          message={error}
          onRetry={refetch}
        />
      ) : visibleProducts.length === 0 ? (
        <EmptyState
          title="No products found"
          message={
            search || category
              ? 'Try adjusting your search criteria or clearing your filters.'
              : 'Your inventory appears to be empty.'
          }
          action={
            search || category ? (
              <Button variant="secondary" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            ) : (
              <Link to="/products/new">
                <Button variant="primary">Add Your First Product</Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {viewMode === 'table' ? (
            <ProductTable
              products={visibleProducts}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={setSort}
              onDelete={handleOpenDelete}
            />
          ) : (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {visibleProducts.map((p) => (
                <ProductCard key={p.id} product={p} onDelete={handleOpenDelete} />
              ))}
            </div>
          )}

          {/* Manual Pagination */}
          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(productToDelete)}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        product={productToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
