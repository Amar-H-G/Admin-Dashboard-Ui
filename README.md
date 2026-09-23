# AdminCore — Product Management Dashboard

A production-grade, responsive **Product Admin Dashboard** built with **React 19**, **Vite**, **Tailwind CSS**, and **DummyJSON API**.

---

## 🚀 Key Highlights & Architecture

- **Clean Component Architecture**: Separation of concerns across UI primitives (`components/common`), feedback indicators (`components/feedback`), business pages (`pages/`), custom hooks (`hooks/`), state providers (`context/`), and network logic (`api/`).
- **Resilient Network & Race Condition Prevention**: Employs `AbortController` cancellation signals on high-frequency search keystrokes and verifies controller identity before any state updates, guaranteeing stale responses cannot overwrite current data.
- **URL-Driven State**: Filter parameters (`search`, `category`, `sortBy`, `sortOrder`, `page`, `limit`) are synchronized directly with the browser's URL query string. Refreshing, bookmarking, or sharing URLs preserves dashboard state.
- **Authentication Lifecycle**: DummyJSON auth endpoint integration with token caching, profile persistence, and route guard (`ProtectedRoute`) redirecting unauthenticated users to login.
- **Dual View Modes**: Switch seamlessly between a high-density tabular view (`ProductTable`) and an e-commerce visual grid (`ProductCard`) with layout persistence in `localStorage`.
- **UX & Accessibility**:
  - Full skeleton loaders during data fetch (`ProductTableSkeleton`, `ProductDetailsSkeleton`, `FormSkeleton`).
  - Graceful empty states (`EmptyState`) with reset actions.
  - Actionable error states with retry mechanisms (`ErrorState`).
  - Modal confirmation workflows for non-destructive safety (`DeleteConfirmModal`).
  - Interactive toast notifications powered by `react-hot-toast`.
  - Accessible form controls with real-time field validation, helper messages, and instant thumbnail previews.

---

## 🛠️ Tech Stack & Architectural Decisions

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | [React 19](https://react.dev/) | Standard industry choice with concurrent rendering and modern hook primitives. |
| **Bundler** | [Vite 8](https://vitejs.dev/) | Blazing fast ESM dev server and optimized Rollup production builds (< 500ms). |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) | Robust client-side routing, query param hooks (`useSearchParams`), and nested layouts with `<Outlet />`. |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern CSS-first engine with `@theme` design tokens, responsive breakpoints, and no utility bloat. |
| **Icons** | SVG / [@heroicons/react](https://heroicons.com/) | Crisp, accessible, lightweight vector graphics. |
| **HTTP Client** | [Axios](https://axios-http.com/) | Centralized base client with request interceptors (Bearer token attachment) and unified response error normalization. |
| **Toasts** | [react-hot-toast](https://react-hot-toast.com/) | Unobtrusive, accessible toast alerts for async feedback. |
| **Testing** | Node.js Test Runner (`node:test`, `node:assert`) | Built-in zero-dependency testing with high performance and cross-platform compatibility. |

---

## 📂 Project Structure

```
src/
├── api/
│   ├── axiosClient.js          # Central Axios client with request & error interceptors
│   ├── authApi.js              # Login authentication API
│   ├── categoryApi.js          # Category fetching API
│   └── productApi.js           # CRUD product endpoints
├── components/
│   ├── common/                 # Reusable UI primitives (Button, Input, Select, Badge, Modal, etc.)
│   ├── feedback/               # EmptyState, ErrorState
│   ├── layout/                 # DashboardLayout, Sidebar, Header
│   ├── products/               # ProductTable, ProductCard, ProductToolbar, Pagination, DeleteConfirmModal
│   └── skeletons/              # High-fidelity loading skeletons (table, cards, details, forms)
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
├── __tests__/
│   └── unit.test.js            # Automated test suite for validators, formatters, and pagination
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

### 4. Run Automated Tests
```bash
npm test
```

### 5. Build for Production
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

## 🌟 Key Strategies & Explanations

### 1. URL State & Query Sync
Filter and pagination parameters are stored in URL search params (`?page=2&limit=20&search=phone&category=smartphones&sortBy=price&sortOrder=asc`).
- Invalid integers like `page=abc`, `page=-5`, `limit=999` are automatically sanitized via `parseIntSafe`.
- Modifying a search query or changing category automatically resets the page to `1`.
- Browser back/forward buttons seamlessly restore previous views.

### 2. Race-Condition Handling & Request Cancellation
When typing rapidly in the search bar:
- Search input is debounced by 400ms before querying.
- Each new request initializes an `AbortController`. In-flight requests are immediately aborted.
- Crucially, before updating local state (`setProducts`), `useProducts` verifies `if (abortRef.current !== controller) return;`, ensuring out-of-order delayed responses cannot overwrite fresh state.

### 3. Search + Category Filtering Strategy
DummyJSON's API does not support combined server-side search and category filtering in a single endpoint (`/products/search` only takes query `q`).
- When both search and category are applied, the application queries `/products/search?q={query}&limit=100` and filters by `category` client-side, followed by sorting and client-side pagination.
- When only category is selected, it uses `/products/category/{category}`.
- When neither is selected, it paginates standard catalog data via `/products?limit={limit}&skip={skip}`.

### 4. DummyJSON CRUD Limitations & Local Persistence Strategy
DummyJSON is a mock backend that returns mock responses for `POST`, `PUT`, and `DELETE` without permanently mutating its remote database.
- **Add Product**: Posts payload to `/products/add`, receives created mock product with ID, displays success toast, and navigates to the catalogue.
- **Edit Product**: Puts updated payload to `/products/{id}`, receives updated mock object, shows success toast, and updates view.
- **Delete Product**: Calls `DELETE /products/{id}`. The deleted product ID is tracked in optimistic component state (`deletedIds` set) so it immediately vanishes from the user's dashboard view.

### 5. Skeleton Loading Strategy
Rather than using a single full-page spinner, high-fidelity skeletons mimic the exact layout:
- **Table view**: Grid-aligned skeleton rows matching table column dimensions.
- **Mobile view**: Card skeletons with matching aspect ratios.
- **Product details**: Left image gallery skeleton with right specification grid.
- **Form**: Field label and input skeletons.

### 6. Error Handling & Recovery
All network operations are wrapped in try/catch blocks with error normalization via Axios interceptors.
- Stale network cancellations are silently ignored.
- User-facing errors show clear messages with a "Retry" button.
- Modals and forms prevent duplicate submissions by disabling buttons while `isSubmitting` or `isDeleting` is active.

---

## 🧪 Testing & Quality Assurance

The application includes an automated test suite verifying core business logic:
- `validateLoginForm` & `validateProductForm` bounds and constraints.
- `formatCurrency`, `formatRating`, `formatStock`, `slugToLabel`, `truncate`.
- Pagination calculations (upper/lower bounds, out-of-bounds clamping, zero results).

Run the tests via:
```bash
npm test
```

---

## 🚢 Deployment Information

The project is built as a pure client-side Single Page Application (SPA).
- Production build outputs optimized static assets to `dist/`.
- Deployable directly on **Vercel**, **Netlify**, **Cloudflare Pages**, or **GitHub Pages** (with standard SPA rewrite rule redirecting all paths to `index.html`).
