# A2Z Parts - Heavy Equipment Aftermarket Parts Platform - Master Project Index (فهرس المشروع الرئيسي)

> **Official Store Brand:** A2Z Parts (A2Z - متجر وكتالوج قطع غيار ومعدات الآليات الثقيلة العالمي بنمط وتصميم FridayParts).
> **Visual Identity:** Royal Blue `#0D5CB6` Top Bar & Primary Buttons, Industrial Light Slate `#F8FAFC`, Pure White Cards `#FFFFFF`, Strict Zero Emoji Policy (Strict Lucide SVG Icons).
> **Architectural Vision:** High-Performance, Cloud-Ready, Decoupled E-Commerce System capable of scaling to 20,000+ indexed parts, concurrent real-time checkout with zero overselling, and unified Mobile/Web REST API consumption.

---

## 🏗️ 1. Global Directory Map (خريطة هيكل المشروع)

```
atoz/
├── backend/                                   # NestJS API Server (REST v1, Swagger, Prisma, Redis)
│   ├── prisma/
│   │   ├── migrations/                        # Database migration history
│   │   ├── schema.prisma                      # Database models, indexes, relations & enums
│   │   └── seed.ts                            # Seeder: 16 Heavy Machinery Categories & 36 Real OEM Spare Parts
│   ├── src/
│   │   ├── common/                            # Shared mobile/web architecture components
│   │   │   ├── decorators/
│   │   │   │   ├── current-user.decorator.ts  # @CurrentUser() parameter decorator
│   │   │   │   └── roles.decorator.ts         # @Roles() RBAC decorator
│   │   │   ├── dto/
│   │   │   │   └── pagination-query.dto.ts    # Capped pagination (max 50) + cursor scrolling
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts   # Unified error response envelope filter
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts          # Bearer JWT passport authentication guard
│   │   │   │   ├── optional-jwt-auth.guard.ts # Optional JWT authentication for guest/user cart & orders
│   │   │   │   └── roles.guard.ts             # Role-based authorization guard
│   │   │   ├── interceptors/
│   │   │   │   └── transform-response.interceptor.ts # Unified success response envelope interceptor
│   │   │   └── interfaces/
│   │   │       └── api-response.interface.ts  # Standard ApiResponse<T> contract
│   │   ├── database/
│   │   │   ├── prisma.module.ts               # Global database provider module
│   │   │   └── prisma.service.ts              # Connection lifecycle & error handling
│   │   ├── modules/
│   │   │   ├── users/                         # User domain module
│   │   │   │   ├── users.module.ts            # UsersModule export
│   │   │   │   └── users.service.ts           # User queries, registration & sanitization
│   │   │   ├── auth/                          # Authentication & session rotation module
│   │   │   │   ├── dto/
│   │   │   │   │   ├── auth-response.dto.ts   # OpenAPI response definitions
│   │   │   │   │   ├── login.dto.ts           # Login validation DTO
│   │   │   │   │   ├── refresh-token.dto.ts   # Refresh token rotation DTO
│   │   │   │   │   └── register.dto.ts        # Customer registration DTO
│   │   │   │   ├── strategies/
│   │   │   │   │   └── jwt.strategy.ts        # Passport JWT Bearer extraction strategy
│   │   │   │   ├── auth.controller.ts         # /api/v1/auth endpoints
│   │   │   │   ├── auth.module.ts             # AuthModule registration
│   │   │   │   └── auth.service.ts            # Token signing, bcrypt hashing, rotation
│   │   │   ├── categories/                    # Hierarchical categories module
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-category.dto.ts # Category creation validation
│   │   │   │   │   └── update-category.dto.ts # Partial category updates
│   │   │   │   ├── categories.controller.ts   # Public tree & Admin CRUD endpoints
│   │   │   │   ├── categories.module.ts       # CategoriesModule
│   │   │   │   └── categories.service.ts      # Tree structuring & slugification
│   │   │   ├── products/                      # 20k+ Products engine
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-product.dto.ts  # Product & image gallery creation DTO
│   │   │   │   │   ├── query-products.dto.ts  # Dual pagination & filtering DTO
│   │   │   │   │   └── update-product.dto.ts  # Partial product updates
│   │   │   │   ├── products.controller.ts     # Public catalog search & Admin CRUD endpoints
│   │   │   │   ├── products.module.ts         # ProductsModule
│   │   │   │   └── products.service.ts        # Capped queries, cursor scrolling, zero N+1
│   │   │   ├── cart/                          # Persistent guest & authenticated cart module
│   │   │   │   ├── dto/
│   │   │   │   │   ├── add-cart-item.dto.ts   # Add product item DTO
│   │   │   │   │   ├── merge-cart.dto.ts      # Guest to user merge DTO
│   │   │   │   │   └── update-cart-item.dto.ts# Modify item quantity DTO
│   │   │   │   ├── cart.controller.ts         # /api/v1/cart endpoints
│   │   │   │   ├── cart.module.ts             # CartModule
│   │   │   │   └── cart.service.ts            # Live stock validation & totals
│   │   │   ├── orders/                        # Checkout & atomic stock reservation module
│   │   │   │   ├── dto/
│   │   │   │   │   ├── checkout.dto.ts        # Immutable checkout snapshot DTO
│   │   │   │   │   └── query-orders.dto.ts    # Paginated orders query DTO
│   │   │   │   ├── orders.controller.ts       # /api/v1/orders endpoints
│   │   │   │   ├── orders.module.ts           # OrdersModule
│   │   │   │   └── orders.service.ts          # Serializable PG transactions & atomic locking
│   │   │   └── payments/                      # Stripe Visa & PayPal payments engine
│   │   │       ├── dto/
│   │   │       │   ├── confirm-payment.dto.ts # Client settlement confirmation DTO
│   │   │       │   ├── create-payment-intent.dto.ts # Payment intent creation DTO
│   │   │       │   └── payment-response.dto.ts# OpenAPI response models
│   │   │       ├── payments.controller.ts     # /api/v1/payments endpoints
│   │   │       ├── payments.module.ts         # PaymentsModule
│   │   │       └── payments.service.ts        # Stripe/PayPal SDK, idempotency replay & inventory settlement
│   │   ├── app.controller.ts                  # Root health & status endpoint with Swagger docs
│   │   ├── app.module.ts                      # Root NestJS module
│   │   ├── app.service.ts                     # System status service
│   │   └── main.ts                            # Bootstrap (Swagger UI, Validation, Helmet, CORS)
│   ├── test/                                  # Testing suites
│   │   ├── app.e2e-spec.ts                    # Complete E2E tests for Auth, Catalog, Cart, Orders & Payments
│   │   └── heavy-equipment.e2e-spec.ts        # Heavy Machinery Concurrency, Race Condition & Webhook Suite
│   ├── scripts/
│   │   └── run-heavy-equipment-audit.ts       # Real-time performance benchmark & integration audit runner
│   ├── .env.example                           # Documented environment templates
│   ├── .env                                   # Local development configuration
│   ├── package.json                           # Dependencies (NestJS 12, Prisma, Swagger, etc.)
├── frontend/                                  # Next.js 15+ App Router, Tailwind CSS, Lucide, Zustand
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                     # Root layout with Header, Footer, CartDrawer & BottomNav
│   │   │   ├── page.tsx                       # Home page (Hero, OEM search, Brands, Featured parts)
│   │   │   ├── products/
│   │   │   │   ├── page.tsx                   # Catalog page (Search, Brands, Filters, Grid)
│   │   │   │   └── [idOrSlug]/page.tsx        # Product Details (OEM specs, weight, compatible models)
│   │   │   └── checkout/page.tsx              # Checkout page (Site address, notes, Stripe/PayPal)
│   │   ├── components/
│   │   │   ├── header/Header.tsx              # Top bar, OEM search, Brand navigation, Cart counter
│   │   │   ├── product/ProductCard.tsx        # Heavy machinery product card (OEM badge, weight, specs)
│   │   │   ├── cart/CartDrawer.tsx            # Slide-over cart sheet with weight & subtotal calculations
│   │   │   ├── navigation/MobileBottomNav.tsx # Thumb-friendly mobile navigation for field technicians
│   │   │   ├── footer/Footer.tsx              # Industrial warranty & emergency support footer
│   │   │   └── ui/                            # Buttons, Badges, Cards
│   │   ├── lib/
│   │   │   ├── api.ts                         # REST API Client with session/token handling
│   │   │   └── utils.ts                       # cn, formatPrice, formatWeight
│   │   └── stores/
│   │       └── useCartStore.ts                # Zustand store synchronized with backend cart
│   ├── next.config.ts                         # Next.js config with remote image patterns
│   └── package.json                           # Dependencies (Next 15, React 19, Tailwind, Zustand)
├── docs/                                      # Blueprints & Documentation
├── docker-compose.yml                         # PostgreSQL 16 & Redis 7 container orchestration
├── PROJECT_INDEX.md                           # Master Project Index (هذا الفهرس)
└── .gitignore                                 # Git ignore patterns
```

---

## 🗄️ 2. Database Models Index (فهرس نماذج قاعدة البيانات - PostgreSQL via Prisma)

File: [`backend/prisma/schema.prisma`](file:///e:/atoz/backend/prisma/schema.prisma)

| Model | Table Name | Purpose | Key Indices & Optimizations |
| :--- | :--- | :--- | :--- |
| `User` | `users` | Accounts, Roles, Auth Profile | `email (unique)`, `(role, status)`, `createdAt` |
| `RefreshToken` | `refresh_tokens` | Multi-device Web & Mobile token rotation | `tokenHash (unique)`, `userId`, `expiresAt` |
| `Address` | `addresses` | Customer shipping & billing addresses | `userId` |
| `Category` | `categories` | Hierarchical taxonomy (Parent-Child) | `slug (unique)`, `parentId`, `(isActive, order)` |
| `Product` | `products` | 20,000+ Products catalog | `slug (unique)`, `sku (unique)`, `(status, createdAt desc)`, `(categoryId, status, price)`, `(isFeatured, status)`, `(salesCount desc)` |
| `ProductImage` | `product_images` | Gallery images, order, primary badge | `(productId, sortOrder)` |
| `Cart` | `carts` | Guest sessions & authenticated carts | `userId (unique nullable)`, `sessionId (unique nullable)` |
| `CartItem` | `cart_items` | Products in cart with quantities | `(cartId, productId) unique`, `cartId`, `productId` |
| `Order` | `orders` | Purchases & immutable checkout snapshot | `orderNumber (unique)`, `userId`, `(status, paymentStatus)`, `createdAt desc` |
| `OrderItem` | `order_items` | Snapshot of purchased products & prices | `orderId`, `productId` |
| `PaymentTransaction` | `payment_transactions` | Payment log (Stripe/Visa, PayPal) | `idempotencyKey (unique)`, `transactionId`, `orderId`, `(provider, status)` |
| `StockReservation` | `stock_reservations` | Real-time stock reservation lock | `orderId`, `productId`, `(status, expiresAt)` |

---

## 🌐 3. API Contract & Standards (معايير واجهات البرمجة)

- **Base URL:** `http://localhost:4000/api/v1`
- **Interactive Documentation:** `http://localhost:4000/api/docs` (Swagger / OpenAPI 3.0)
- **Security & Headers:** Helmet, Gzip Compression, CORS enabled for Web & Mobile.

### Active Endpoints:

| Method | Endpoint | Description | Swagger Tag | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1` | System health, uptime, version & metadata | `System & Health` | No |
| `GET` | `/api/docs` | Swagger Interactive UI & OpenAPI JSON | System | No |
| `POST` | `/api/v1/auth/register` | Register customer with password hashing & dual JWT tokens | `Auth` | No |
| `POST` | `/api/v1/auth/login` | Authenticate with email/password and track device info | `Auth` | No |
| `POST` | `/api/v1/auth/refresh` | Rotate refresh token and issue new JWT pair | `Auth` | No |
| `POST` | `/api/v1/auth/logout` | Revoke refresh token for client device | `Auth` | No |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile via `@CurrentUser()` | `Auth` | **Yes (Bearer JWT)** |
| `GET` | `/api/v1/categories` | Public category tree (parent/child) with product counts | `Categories` | No |
| `GET` | `/api/v1/categories/:idOrSlug` | Category details by ID or SEO slug | `Categories` | No |
| `POST` | `/api/v1/categories` | Create category | `Categories` | **Yes (Admin/Manager)** |
| `PATCH` | `/api/v1/categories/:id` | Update category attributes | `Categories` | **Yes (Admin/Manager)** |
| `DELETE` | `/api/v1/categories/:id` | Delete empty category | `Categories` | **Yes (Admin/Manager)** |
| `GET` | `/api/v1/products` | Capped search & filters (Offset/Cursor, max 50, zero N+1) | `Products` | No |
| `GET` | `/api/v1/products/:idOrSlug` | Product details with gallery by ID or slug (+ view count) | `Products` | No |
| `POST` | `/api/v1/products` | Create product with image gallery & stock | `Products` | **Yes (Admin/Manager)** |
| `PATCH` | `/api/v1/products/:id` | Update product pricing, inventory or metadata | `Products` | **Yes (Admin/Manager)** |
| `DELETE` | `/api/v1/products/:id` | Archive product from catalog visibility | `Products` | **Yes (Admin/Manager)** |
| `GET` | `/api/v1/cart` | Get cart items, live inventory checks & calculated totals | `Cart` | Optional (Guest/User) |
| `POST` | `/api/v1/cart/items` | Add product to cart with inventory validation | `Cart` | Optional (Guest/User) |
| `PATCH` | `/api/v1/cart/items/:productId` | Update item quantity in cart | `Cart` | Optional (Guest/User) |
| `DELETE` | `/api/v1/cart/items/:productId`| Remove specific item from cart | `Cart` | Optional (Guest/User) |
| `DELETE` | `/api/v1/cart` | Empty all items from current cart | `Cart` | Optional (Guest/User) |
| `POST` | `/api/v1/cart/merge` | Merge guest session items into user cart on login | `Cart` | **Yes (Bearer JWT)** |
| `POST` | `/api/v1/orders/checkout` | Convert cart to order with atomic stock lock & reservation | `Orders` | Optional (Guest/User) |
| `GET` | `/api/v1/orders` | List paginated purchase orders for logged-in user | `Orders` | **Yes (Bearer JWT)** |
| `GET` | `/api/v1/orders/:idOrOrderNumber`| Get detailed order information & snapshot breakdown | `Orders` | Optional (Owner/Admin)|
| `POST` | `/api/v1/payments/create-intent` | Create payment session (Stripe or PayPal) with Idempotency Key protection | `Payments` | No (Header / Body Idempotency) |
| `POST` | `/api/v1/payments/confirm` | Confirm client SDK payment settlement & commit inventory | `Payments` | No |
| `POST` | `/api/v1/payments/webhook/stripe` | Stripe webhook listener with cryptographic signature verification (`rawBody`) | `Payments` | No (Stripe Signature) |
| `POST` | `/api/v1/payments/webhook/paypal` | PayPal Orders v2 webhook listener | `Payments` | No |
| `GET` | `/api/v1/payments/status/:orderId` | Check payment & fulfillment status for an order | `Payments` | No |
| `GET` | `/api/v1/admin/analytics/overview` | Executive KPIs, revenue, status breakdown, low-stock alerts | `Admin` | Yes (`ADMIN`, `MANAGER`) |
| `GET` | `/api/v1/admin/orders` | Filterable field orders with search & OEM items | `Admin` | Yes (`ADMIN`, `MANAGER`) |
| `PATCH` | `/api/v1/admin/orders/:id/status` | Update order fulfillment status, tracking #, notes | `Admin` | Yes (`ADMIN`, `MANAGER`) |
| `PATCH` | `/api/v1/admin/products/:id/quick-update` | Instant patch for price, stock, cost, compare-at | `Admin` | Yes (`ADMIN`, `MANAGER`) |
| `GET` | `/api/v1/admin/invoices` | B2B corporate tax invoices, buyer VAT numbers, gross weights | `Admin` | Yes (`ADMIN`, `MANAGER`) |

### Standard Response Envelope (نجاح العملية):
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "message": "Operation successful",
  "statusCode": 200,
  "timestamp": "2026-10-10T00:38:00.000Z",
  "path": "/api/v1/orders"
}
```

---

## 🛡️ 4. Inventory & Financial Integrity Rules (قواعد حماية المخزون والعمليات المالية)

1. **Atomic Stock Decrement (حركات المخزون الذرية داخل Transaction):**
   - حظر الاستعلام المسبق تليه عملية حفظ عادية (`find` ثم `update`).
   - خصم المخزون وحجزه ينفذ حصراً داخل PostgreSQL Transaction باستخدام:
     ```sql
     UPDATE "products" 
     SET "stock" = "stock" - :quantity, 
         "reservedStock" = "reservedStock" + :quantity,
         "updatedAt" = NOW()
     WHERE "id" = :productId AND "stock" >= :quantity;
     ```
   - إذا كان عدد الصفوف المعدلة = 0، يُلغى الطلب فوراً وترمى استثناء `ConflictException` (409) لحماية المخزون من البيع المزدوج في أجزاء من الثانية.
2. **StockReservation Table (حجز المخزون المؤقت):**
   - ينشئ النظام سجلاً في جدول `stock_reservations` بحالة `RESERVED` ومدة صلاحية 30 دقيقة لتحرير المخزون تلقائياً في حال لم تكتمل عملية الدفع.
3. **Idempotency Key (مفتاح التفرد):**
   - يمنع إنشاء دفعة مكررة عند انقطاع الاتصال في تطبيق الهاتف أو الويب عبر قيد `idempotencyKey UNIQUE` في جدول `payment_transactions`.
4. **Webhook Cryptographic Verification:**
   - توقيع الـ Webhooks من Stripe و PayPal يتم التحقق منه قبل قراءة أو قبول الـ Payload (`rawBody: true` مفعّل في NestJS).
5. **Inventory & Sales Settlement (دورة حياة المخزون بعد الدفع):**
   - عند نجاح الدفع (`PAID`): تُخصم كمية `reservedStock` وتُضاف إلى `salesCount`، وتتحول حالة الحجز إلى `COMMITTED` وحالة الطلب إلى `PROCESSING`.
   - عند فشل الدفع (`FAILED`): يُعاد المخزون تلقائياً (`stock = stock + qty` و `reservedStock = reservedStock - qty`) وتتحول حالة الحجز إلى `RELEASED`.

---

## 🚀 5. Module Implementation Status (حالة تنفيذ الوحدات)

- [x] **Project Scaffolding & Directory Setup** (`backend/` & `frontend/`)
- [x] **Master Index `PROJECT_INDEX.md`**
- [x] **NestJS Server Architecture (NestJS 12 + TypeScript + ES Modules)**
- [x] **Prisma ORM & PostgreSQL Database Schema** (12 Models + 8 Enums + Composite Indexes)
- [x] **Prisma Client Generated** (`@prisma/client`)
- [x] **OpenAPI / Swagger Engine** (Configured at `/api/docs`)
- [x] **Global ValidationPipe & DTO Sanitization** (`class-validator` + `class-transformer`)
- [x] **Unified Mobile-First Response Envelope & Exception Filter**
- [x] **Infrastructure Stack (PostgreSQL 16 & Redis 7 via Docker Compose - Running & Healthy)**
- [x] **Database Migration (`init` migration successfully applied via Prisma Migrate)**
- [x] **NestJS Dev Server Running & Live (Port 4000, Swagger at `/api/docs`)**
- [x] **Auth & Users Modules (JWT Access + Refresh Tokens, Device Tracking, Token Rotation)**
- [x] **Categories Module (Hierarchical Tree, Slugify, RBAC Admin Endpoints)**
- [x] **Products Catalog Engine (20,000+ items scale, Offset/Cursor Pagination, Zero N+1, Fast Filters)**
- [x] **Database Seeding (`seed.ts` - 50 Rich Products, 11 Categories, Admin Account)**
- [x] **Cart Engine (Guest session via `sessionId` & User Cart via `userId`, Live Stock Check, Cart Merge)** *(مكتمل 100%)*
- [x] **Orders & Atomic Stock Reservation Engine (Serializable PG Transactions, Zero Double-Selling, Snapshots)** *(مكتمل 100%)*
- [x] **Payment Gateways (Stripe Visa + PayPal Orders v2 + Idempotency Replay + Webhooks + Stock Settlement)** *(مكتمل 100%)*
- [x] **Customer Storefront (Next.js 15 App Router + Tailwind CSS + Lucide + Zustand + Mobile-First UI)** *(مكتمل 100%)*
- [x] **Admin Dashboard Suite (`/admin`)** *(مكتمل 100%)*
  - [x] `backend/src/modules/admin/` (Analytics, Orders Management, Quick Stock/Price Patch, B2B Invoices with RBAC `ADMIN` & `MANAGER`)
  - [x] `frontend/src/app/admin/layout.tsx` (Industrial dark sidebar, real-time auth guard with direct login fallback)
  - [x] `frontend/src/app/admin/page.tsx` (Executive KPIs, revenue, processing queue, urgent low-stock alerts)
  - [x] `frontend/src/app/admin/orders/page.tsx` (Field orders table, 1-click status dropdown transition, OEM line-items modal)
  - [x] `frontend/src/app/admin/inventory/page.tsx` (Fast stock/price patch, SKU/OEM search, low-stock filter toggle)
  - [x] `frontend/src/app/admin/invoices/page.tsx` (B2B corporate invoices, printable official ZATCA tax invoice view)
- [x] **FridayParts Visual Identity & Complete Redesign (A2Z Parts - المرحلة 8)** *(مكتمل 100%)*
  - [x] **Brand Re-naming:** Officially renamed from AtoZ to **A2Z Parts** (or **A2Z**).
  - [x] **Strict Zero Emoji Enforcement:** 100% removal of all emojis across all code files, replaced exclusively by clean SVG icons from `lucide-react`.
  - [x] **FridayParts Royal Blue Theme:**
    - Top Bar: Full Royal Blue `#0D5CB6` with A2Z logo, "Select Model" popover, oval search pill, and utility icons (currency, support, account, cart counter).
    - Sub-Header Bar: Clean white navigation (All Categories, All Brands, All Equipment, Fast Moving Parts, Pro Fleet Club, About A2Z).
  - [x] **Rebuilt Homepage (`frontend/src/app/page.tsx`):**
    - High-impact Hero ("Fix It Right, End Downtime - Heavy Equipment Aftermarket Parts") with interactive model selector box.
    - Dual Promotional Banners: Engine & Water Pumps Cooling / A2Z Pro Fleet Club (Contractor Wholesale).
    - "Find Parts by Category" Section (`<CategoryTabsSection />`): 8 horizontal category tabs + 16 pure white cards with part counts and isolated visuals.
    - "Find Aftermarket Parts by Brand": Bordered grid buttons (For CAT, For KOMATSU, For BOBCAT, For JCB, For CUMMINS, For KUBOTA, For VOLVO, For HITACHI, For DEUTZ, For DOOSAN, For JOHN DEERE, For PERKINS, For CASE, For YANMAR, For HYUNDAI, For ISUZU) + "View All Brands" pill button.
    - "Find Parts by Machine": Light blue technical line circular icons (Excavators, Wheel Loaders, Bulldozers, Compact Loaders, Forklifts, Generators, Heavy Engines, Scissor Lifts).
    - "Fast-Moving Parts": Live backend integration pulling real parts from `/api/v1/products`.
    - Customer Trust & Reviews Widget: Google Reviews 4.8 / 5.0 Stars + 4 Corporate Assurance pillars.
  - [x] **Rebuilt Core Components:** `ProductCard`, `CartDrawer`, `Footer`, `MobileBottomNav`, `Button`, `Badge`.
  - [x] **Production Verification:** Clean Next.js 16 build (`npm run build` exit code 0) and live dev server verified at `http://localhost:3000/`.
- [x] **Bilingual RTL/LTR & Real-Time Multi-Currency Engine (المرحلة 9)** *(مكتمل 100%)*
  - [x] **Language & Direction System:**
    - Zustand store `useLanguageStore`: manages `lang` ('ar' default | 'en'), `dir` ('rtl' | 'ltr'), dynamic `document.documentElement` attributes (`dir` & `lang`), and `localStorage` persistence (`a2z_selected_lang`).
    - Comprehensive translation dictionaries: `src/locales/ar.json` and `src/locales/en.json` covering headers, navigation, banners, categories, brands, product cards, cart drawer, checkout, and footer.
    - Geometric Arabic typography integrated seamlessly: `Cairo` font via `next/font/google` and CSS variable `--font-cairo`.
  - [x] **Real-Time Multi-Currency Engine:**
    - Zustand store `useCurrencyStore`: Base reference currency USD with real-time conversion rates:
      - USD ($): 1.0
      - SAR (ر.س): 3.75
      - AED (د.إ): 3.67
      - JOD (د.أ): 0.71 (3 decimals)
      - EUR (€): 0.92
    - Centralized `formatPrice(amount, currency, lang)` handling decimal precision, localized symbol placement (suffix for Arabic, prefix/code for English), and `localStorage` persistence (`a2z_selected_currency`).
  - [x] **UI & Component Integration:**
    - `Header.tsx`: Quick language toggle (`Globe` icon) and multi-currency dropdown selector (`Coins` / `ChevronDown`) in the top FridayParts Royal Blue bar.
    - `ProductCard.tsx`: Reactive instant price calculation in selected currency, bilingual stock badges, OEM indicators, and weight tags.
    - `CartDrawer.tsx`: Dynamic slide direction (LTR/RTL), real-time converted item lines, 5% VAT, free shipping qualification, and total due.
    - `CategoryTabsSection.tsx` & `HomeClientView.tsx`: Full bilingual reactivity across homepage, category tabs, and machinery grids.
    - `ProductsClientView.tsx`: Bilingual catalog header, breadcrumbs, search/filter sidebar, and sorting bar.
    - `ProductDetailClientView.tsx` & `AddToCartDetailButton.tsx`: Real-time converted price box, bilingual specs table, and fitment details.
    - `CheckoutPage.tsx`: Live currency conversion and bilingual form fields, tax calculation, and order tracking confirmation.
  - [x] **Production Verification:** Zero TypeScript errors and clean `npm run build` (exit code 0).
- [x] **Storefront Frontend Architecture & Design Specification (المرحلة 10 - المعيار القياسي الشامل)** *(مكتمل 100%)*
  - [x] **المرحلة 1: نظام التوكنات والطباعة والأساس (Design System & Tokens §1.2 - §1.5):**
    - تهيئة `globals.css` و `@theme inline` بتوكنات الألوان الهندسية الصناعية: `--background` (#FFFFFF), `--foreground` (#111827), `--muted` (#F3F4F6), `--border` (#E5E7EB), `--control-border` (#8B93A1), `--ink` (#111827), `--primary` (#0D5CB6), `--sale` (#DC2626), `--price-sale` (#B91C1C), `--member` (#0F766E), `--success` (#15803D).
    - الطباعة (§1.3): استخدام `Inter` للواجهات العامة والنصوص، و `JetBrains Mono` حصراً لجميع أرقام الـ OEM ورموز الـ SKU مع تفعيل `.sku-mono tabular-nums slashed-zero` لمنع التباس الصفر والحروف، مع الاحتفاظ بـ `Cairo` عند تفعيل العربية.
    - الظلال والحدود: تطبيق مستويات الظلال الأربعة (`--shadow-e1` حتى `--shadow-e4`) وحدود التحكم 44px لمكونات `Button`, `Input`, `Badge`.
  - [x] **المرحلة 2: الترويسة المتقدمة والملاحة العامة (Header, Search & Mega Menu §2):**
    - Band 0 (Announcement): شريط علوي بارتفاع 36px بخلفية `--ink` مع إعلانات دورية دوارة (Direct Jobsite Freight, 100% OEM Compatibility, 1-Year Warranty)، زر إغلاق، ومحددات الشحن (Ship-to)، العملة، واللغة.
    - Band 1 (Main Bar): شعار A2Z PARTS، زر "Select Model" التفاعلي (يتحول إلى شريحة نشطة `Fits: Model ✕` عند تحديد معدة)، شريط بحث ذكي Combobox يفرز النتائج إلى مطابقات الـ OEM الدقيقة، المنتجات، موديلات الآليات، الأقسام، والماركات، وزر السلة المرتبط بالمخزن.
    - Band 2 (Primary Nav): قائمة Category المنسدلة الضخمة (Mega Menu لـ 9 منظومات رئيسية و 48 صنفاً فرعياً)، All Brands A-Z، All Equipment (10 أصناف آليات)، Must Buy، و Member Club.
    - محرك ومودال تحديد الآلية (Part Finder Modal §4.1): مخزن حالة `useMachineStore` مع حفظ محلي للآلة النشطة وحساب التوافق الميداني (Exact Fit, Likely Fit, Check Fit).
  - [x] **المرحلة 3: الصفحة الرئيسية المتطابقة مع الكتالوج العالمي (14 قسماً بالترتيب الدقيق §3.1):**
    1. Header & MegaMenu (§2)
    2. Hero Carousel (16:5 ديسكتوب / 4:3 موبايل، 5 بنرات مرتبطة بإجراءات مباشرة وتحكم كامل)
    3. Part Finder Inline (شريط تحديد المعدة الأفقي المدمج)
    4. Trust / Value Bar (100k+ Customers, 1-Year Warranty, 90-Day Returns, 24/7 Helpline)
    5. Find Parts by Category (9 تبويبات وشبكة كروت بيضاء للقطع مع عداد القطع)
    6. Find Aftermarket Parts by Brand (شبكة ماركات المعدات العالمية: 6 أعمدة ديسكتوب، 3 موبايل)
    7. Find Parts by Machine (أيقونات الآليات الهندسية: حفارات، لوادر، بلدوزرات، بوبكات، جرارات...)
    8. Fast-Moving Parts (مخزون القطع الأكثر طلباً مسحوب لحظياً من الباك إند)
    9. What Our Customers Are Saying (تقييم جوجل 4.4/5.0 مع كروت مراجعات أساطيل المقاولين الموثقة)
    10. Why Take Pride in What We Do (3 كروت استدامة وشراكات: UPS Green، معارض Bauma/ConExpo، ومعايرة الفنيين المعتمدة)
    11. Community Banner (مجتمع مشغلي وفنيي المعدات الثقيلة والمقاولين)
    12. Offers Pair (See All Offers & Shop With Pros B2B Wholesale)
    13. More Reasons to Love Us (3 أدلة صيانة وفحص أعطال ميدانية)
    14. Coupon Newsletter Strip (قسيمة $20 فورية، حقل الإيميل، وزر الإرسال)
    15. Full Engineering Footer (§2.5 مع سلال الروابط وسجلات الـ SEO وبوابات الدفع وإخلاء المسؤولية)
  - [x] **المرحلة 4: بطاقة المنتج (Product Card §3.2):**
    - صورة 1:1 بخلفية بيضاء نقية وحواف رمادية ناعمة، شارة الخصم (−13%)، شارات CLEARANCE و MUST BUY، كود الـ OEM الرئيسي بخط JetBrains Mono عريض، شريحة التوافق الميداني (Fit Chip)، السعر باللون الأحمر `--price-sale`، وسعر الأعضاء `--member`، ومؤشر المخزون بالنقاط الملونة، وزر الإضافة السريع.
  - [x] **المرحلة 5: الربط والتحقق والإنتاج:**
    - نجاح فحص البناء `npm run build` بنسبة 100% وخلو المشروع بالكامل من أخطاء الـ TypeScript والـ Turbopack.
