// src/components/layout/Header.jsx
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
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
    <header className="sticky top-0 z-30 h-16 shrink-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
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

        <button
          onClick={logout}
          title="Sign out"
          aria-label="Sign out"
          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>
    </header>
  );
}
