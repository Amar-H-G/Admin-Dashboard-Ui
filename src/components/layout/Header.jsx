// src/components/layout/Header.jsx
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

export default function Header({ onMenuClick }) {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/products') return 'Product Catalog';
    if (path === '/products/new') return 'Add New Product';
    if (path.startsWith('/products/') && path.endsWith('/edit')) return 'Edit Product';
    if (path.startsWith('/products/')) return 'Product Overview';
    return 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open mobile menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-sm font-semibold text-slate-800 leading-none">
            {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Emily Selman'}
          </span>
          <span className="text-xs text-slate-400 mt-1">Administrator</span>
        </div>

        {user?.image ? (
          <img
            src={user.image}
            alt={user?.firstName || 'User'}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 font-semibold flex items-center justify-center text-sm border border-blue-200">
            {user?.firstName?.[0] || 'E'}
          </div>
        )}
      </div>
    </header>
  );
}
