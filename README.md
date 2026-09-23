# AdminCore — Product Management Dashboard

A production-grade, responsive **Product Admin Dashboard** built with **React 19**, **Vite**, **Tailwind CSS**, and **DummyJSON API**.

---

## 🚀 Key Highlights & Architecture

- **Clean Component Architecture**: Separation of concerns across UI (`components/common`), business views (`pages/`), custom hooks (`hooks/`), state providers (`context/`), and network logic (`api/`).
- **Resilient Network & Race Condition Prevention**: Uses `AbortController` cancellation signals on fast keystroke search queries and route transitions to prevent stale response overwrites.
- **URL-Driven State**: Filter parameters (`search`, `category`, `sortBy`, `sortOrder`, `page`, `limit`) are synchronized directly with the browser's URL query string. Refreshing, bookmarking, or sharing URLs preserves the exact dashboard state.
- **Authentication Lifecycle**: DummyJSON auth endpoint integration with token caching, profile persistence, and route guard (`ProtectedRoute`) redirecting to login.
- **Dual View Modes**: Switch seamlessly between a high-density tabular view (`ProductTable`) and an e-commerce visual grid (`ProductCard`) with layout persistence in `localStorage`.
- **UX & Accessibility**:
  - Full skeleton loaders during data fetch (`ProductTableSkeleton`, `ProductDetailsSkeleton`, `FormSkeleton`).
  - Graceful empty states (`EmptyState`) with reset actions.
  - Actionable error states with retry mechanisms (`ErrorState`).
  - Modal confirmation workflows for non-destructive safety (`DeleteConfirmModal`).
  - Interactive toast notifications powered by `react-hot-toast`.
  - Accessible form controls with real-time field validation, helper messages, and instant thumbnail previews.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) |
| **Bundler** | [Vite 8](https://vitejs.dev/) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with Inter typography & modern design system tokens |
| **Icons** | SVG / [@heroicons/react](https://heroicons.com/) |
| **HTTP Client** | [Axios](https://axios-http.com/) with interceptors |
| **Toasts** | [react-hot-toast](https://react-hot-toast.com/) |

---

## 📂 Project Structure

```
src/
├── api/
│   ├── axiosClient.js          # Base Axios client with request & error interceptors
│   ├── authApi.js              # Login authentication API
│   ├── categoryApi.js          # Category fetching API
│   └── productApi.js           # CRUD product endpoints
├── components/
│   ├── common/                 # Reusable UI primitives (Button, Input, Select, Badge, Modal, etc.)
│   ├── feedback/               # EmptyState, ErrorState
│   ├── layout/                 # DashboardLayout, Sidebar, Header
│   ├── products/               # ProductTable, ProductCard, ProductToolbar, Pagination, DeleteConfirmModal
│   └── skeletons/              # High-fidelity loading skeletons
├── constants/
│   └── index.js                # App constants, pagination defaults, sort keys
├── context/
│   └── AuthContext.jsx         # Global authentication state, session storage, and login/logout handlers
├── hooks/
│   ├── useCategories.js        # Category list loader
│   ├── useDebounce.js          # Value debouncing for live search
│   ├── useProducts.js          # Core product data fetching, abort controller, and sorting logic
│   └── useUrlState.js          # URL query sync for search, filter, and pagination
├── pages/
│   ├── Login/                  # LoginPage with credentials guide and validation
│   ├── Products/               # ProductsPage, ProductDetailsPage, ProductFormPage
│   └── NotFoundPage.jsx        # 404 page
├── utils/
│   ├── formatters.js           # Currency, stock status, ratings, slug helpers
│   └── validators.js           # Schema-less robust client form validation
├── App.jsx                     # Route tree, ProtectedRoute integration, Toaster setup
└── main.jsx                    # Entry point
```

---

## 🏃 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 Demo Credentials

Use any valid DummyJSON account to log in (or click the convenient **Demo Credentials Fill** button on the Login page):

- **Username**: `emilys`
- **Password**: `emilyspass`
- *(Additional DummyJSON users like `michaelw` / `michaelwpass` are also supported)*

---

## 🌟 Features Breakdown

1. **Authentication Flow**:
   - Secure login form with validation, error handling, and password visibility toggle.
   - Session preservation across page reloads.
   - Quick "fill demo credentials" for effortless testing.

2. **Product Catalog & Inventory**:
   - Live debounced search querying the DummyJSON API.
   - Category filtering with dynamic categories from the API.
   - Column-based sorting by Title, Price, Rating, and Stock.
   - Toggle between Table and Grid view layouts.
   - Comprehensive pagination controls (prev, next, page numbers, dynamic page limit).

3. **Product Inspection & Details**:
   - Interactive multi-image gallery with thumbnail selection.
   - Complete inventory specifications (SKU, brand, warranty, shipping, return policy).
   - Rating visualizer and verified customer review breakdown.

4. **Product Creation & Editing**:
   - Controlled form with real-time validation for all required fields.
   - Image URL previewer displaying thumbnail live as you type.
   - Edit mode prefilling data from the API.
   - Non-destructive creation/update notification toasts.
