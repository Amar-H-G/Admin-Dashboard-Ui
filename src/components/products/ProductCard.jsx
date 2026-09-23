// src/components/products/ProductCard.jsx
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import Button from '../common/Button';
import StarRating from '../common/StarRating';
import ProductImage from '../common/ProductImage';
import { formatCurrency, formatStock, slugToLabel } from '../../utils/formatters';

export default function ProductCard({ product, onDelete }) {
  const stockInfo = formatStock(product.stock ?? 0);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-0.5">
      {/* Product Image & Badges */}
      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
        <ProductImage
          src={product.thumbnail || product.images?.[0]}
          title={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          textClassName="text-4xl font-extrabold"
        />
        
        {/* Discount badge */}
        {product.discountPercentage > 0 && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white shadow-xs">
            -{Math.round(product.discountPercentage)}%
          </span>
        )}

        {/* Stock tag */}
        <span
          className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${stockInfo.color} border-current/20 shadow-xs`}
        >
          {stockInfo.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <Badge variant="neutral">{slugToLabel(product.category)}</Badge>
            {product.brand && <span className="truncate max-w-[120px] font-medium">{product.brand}</span>}
          </div>

          <Link
            to={`/products/${product.id}`}
            className="block font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-base leading-snug"
            title={product.title}
          >
            {product.title}
          </Link>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Rating and Price */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <StarRating rating={product.rating || 0} count={product.reviews?.length} size="sm" />
          <div className="text-right">
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>

        {/* Card Actions */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
          <Link to={`/products/${product.id}`} className="contents">
            <Button variant="ghost" size="xs" className="w-full text-slate-600 hover:text-blue-600">
              View
            </Button>
          </Link>
          <Link to={`/products/${product.id}/edit`} className="contents">
            <Button variant="secondary" size="xs" className="w-full">
              Edit
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="xs"
            className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(product)}
            aria-label={`Delete ${product.title}`}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
