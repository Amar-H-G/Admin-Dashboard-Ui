// src/components/products/ProductTable.jsx
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import Button from '../common/Button';
import StarRating from '../common/StarRating';
import ProductImage from '../common/ProductImage';
import { formatCurrency, formatStock, slugToLabel } from '../../utils/formatters';

export default function ProductTable({
  products,
  sortBy,
  sortOrder,
  onSort,
  onDelete,
}) {
  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return (
        <svg className="w-3.5 h-3.5 text-slate-300 ml-1 inline group-hover:text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      );
    }
    return sortOrder === 'asc' ? (
      <svg className="w-3.5 h-3.5 text-blue-600 ml-1 inline" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3.5 h-3.5 text-blue-600 ml-1 inline" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const handleHeaderClick = (field) => {
    if (sortBy === field) {
      onSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'asc');
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-600 border-collapse">
        <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
          <tr>
            <th scope="col" className="py-3.5 px-4 font-semibold w-16">
              Image
            </th>
            <th
              scope="col"
              className="py-3.5 px-4 font-semibold cursor-pointer select-none group"
              onClick={() => handleHeaderClick('title')}
            >
              <div className="flex items-center">
                <span>Product</span>
                {renderSortIcon('title')}
              </div>
            </th>
            <th scope="col" className="py-3.5 px-4 font-semibold hidden md:table-cell">
              Category
            </th>
            <th
              scope="col"
              className="py-3.5 px-4 font-semibold cursor-pointer select-none group"
              onClick={() => handleHeaderClick('price')}
            >
              <div className="flex items-center">
                <span>Price</span>
                {renderSortIcon('price')}
              </div>
            </th>
            <th
              scope="col"
              className="py-3.5 px-4 font-semibold cursor-pointer select-none group hidden sm:table-cell"
              onClick={() => handleHeaderClick('rating')}
            >
              <div className="flex items-center">
                <span>Rating</span>
                {renderSortIcon('rating')}
              </div>
            </th>
            <th
              scope="col"
              className="py-3.5 px-4 font-semibold cursor-pointer select-none group hidden lg:table-cell"
              onClick={() => handleHeaderClick('stock')}
            >
              <div className="flex items-center">
                <span>Stock</span>
                {renderSortIcon('stock')}
              </div>
            </th>
            <th scope="col" className="py-3.5 px-4 font-semibold text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {products.map((product) => {
            const stockInfo = formatStock(product.stock ?? 0);
            return (
              <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                {/* Thumbnail */}
                <td className="py-3 px-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <ProductImage
                      src={product.thumbnail || product.images?.[0]}
                      title={product.title}
                      textClassName="text-base font-bold"
                    />
                  </div>
                </td>

                {/* Title & Brand */}
                <td className="py-3 px-4">
                  <div className="max-w-xs">
                    <Link
                      to={`/products/${product.id}`}
                      className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                      title={product.title}
                    >
                      {product.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      {product.brand && <span className="font-medium text-slate-700">{product.brand}</span>}
                      {product.brand && <span className="text-slate-300">•</span>}
                      <span className="md:hidden text-slate-500">{slugToLabel(product.category)}</span>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 px-4 hidden md:table-cell">
                  <Badge variant="neutral">{slugToLabel(product.category)}</Badge>
                </td>

                {/* Price */}
                <td className="py-3 px-4">
                  <div>
                    <span className="font-semibold text-slate-900">{formatCurrency(product.price)}</span>
                    {product.discountPercentage > 0 && (
                      <span className="block text-[11px] text-rose-600 font-medium">
                        -{Math.round(product.discountPercentage)}% off
                      </span>
                    )}
                  </div>
                </td>

                {/* Rating */}
                <td className="py-3 px-4 hidden sm:table-cell">
                  <StarRating rating={product.rating || 0} size="sm" />
                </td>

                {/* Stock */}
                <td className="py-3 px-4 hidden lg:table-cell">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${stockInfo.color} border-current/20`}
                  >
                    {stockInfo.label}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link to={`/products/${product.id}`}>
                      <Button variant="ghost" size="xs" aria-label="View product">
                        <svg className="w-4 h-4 text-slate-500 hover:text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Button>
                    </Link>

                    <Link to={`/products/${product.id}/edit`}>
                      <Button variant="secondary" size="xs" aria-label="Edit product">
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="xs"
                      aria-label="Delete product"
                      className="text-red-500 hover:bg-red-50 hover:text-red-700"
                      onClick={() => onDelete(product)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
