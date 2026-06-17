# eBook Selling Platform

A production-ready digital eBook store with Next.js 15 frontend, FastAPI backend, MongoDB, Cloudinary, and Cashfree payment gateway.

## 🏗️ Project Structure

```
e-books/
├── frontend/     # Next.js 15 (App Router) + TypeScript + Tailwind + ShadCN
├── backend/      # FastAPI (Python) + Motor (MongoDB) + Cloudinary + Cashfree
└── docker-compose.yml
```

## 🚀 Quick Start (Local Development)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and fill in .env
copy .env.example .env

# Generate admin password hash
python generate_hash.py

# Start backend
uvicorn app.main:app --reload --port 8000
```

Backend will run at: http://localhost:8000  
Swagger docs at: http://localhost:8000/docs

### 2. Frontend Setup

```bash
cd frontend

# Copy and fill in environment variables
copy .env.local.example .env.local

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend will run at: http://localhost:3000

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `DATABASE_NAME` | MongoDB database name |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRE_MINUTES` | Admin JWT expiry (default: 30) |
| `DOWNLOAD_TOKEN_EXPIRE_MINUTES` | Download token expiry (default: 10) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CASHFREE_APP_ID` | Cashfree App ID |
| `CASHFREE_SECRET_KEY` | Cashfree Secret Key |
| `CASHFREE_ENV` | `sandbox` or `production` |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of admin password |
| `ALLOWED_ORIGINS` | CORS origins (JSON array) |
| `FRONTEND_URL` | Frontend URL for redirects |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_CASHFREE_ENV` | `sandbox` or `production` |
| `NEXT_PUBLIC_SITE_URL` | Production frontend URL (for SEO) |

---

## 🌐 API Endpoints

### Public
- `GET /books` — List books (paginated, searchable, filterable)
- `GET /books/{slug}` — Get single book by slug or ID

### Payment
- `POST /payment/create-order` — Create Cashfree payment order
- `POST /payment/verify` — Verify payment and get download token

### Download
- `GET /download/{token}` — Secure PDF download (10-min token)

### Admin (JWT Required)
- `POST /admin/login` — Login, get JWT
- `GET /admin/orders` — List all orders
- `GET /admin/sales` — Sales statistics
- `POST /books` — Create book (multipart)
- `PUT /books/{id}` — Update book
- `DELETE /books/{id}` — Delete book

### Webhook
- `POST /webhook/cashfree` — Cashfree payment webhook

---

## 💳 Payment Flow

```
1. User picks book → fills name/email/phone → clicks Buy
2. POST /payment/create-order → gets payment_session_id
3. Cashfree JS SDK opens payment modal
4. User pays via UPI/card/netbanking
5. Cashfree redirects to /payment-success?cashfree_order_id=xxx
6. POST /payment/verify → backend confirms with Cashfree API
7. Download token (JWT, 10min) returned
8. GET /download/{token} → redirect to Cloudinary signed URL
```

---

## 🔒 Security Features

- Admin routes protected by JWT Bearer tokens
- Download links are time-limited JWTs (10 min)
- PDF files stored as **private** Cloudinary assets
- Cloudinary signed URLs expire in 10 minutes
- Cashfree webhook verified via HMAC-SHA256
- Rate limiting on all public endpoints
- CORS whitelist configuration
- NoSQL injection prevention via Motor/Pydantic
- Password hashing with bcrypt
- XSS prevention via Next.js auto-escaping

---

## 🚀 Deployment

### Frontend → Vercel
1. Push frontend to GitHub
2. Import repo in Vercel
3. Set environment variables
4. Deploy

### Backend → Render
1. Push backend to GitHub
2. Create Web Service in Render
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
5. Set environment variables
6. Deploy

### Database → MongoDB Atlas
1. Create free M0 cluster
2. Create database user
3. Whitelist Render IPs (or 0.0.0.0/0 for all)
4. Copy connection string to `MONGODB_URI`

---

## 📁 Admin Panel

Visit `/admin/login` to access the admin dashboard.

Features:
- 📊 Sales overview (revenue, orders, books)
- 📚 Book management (add, edit, delete)
- 🛒 Order management with status filters

---

## 🔎 SEO Features

- Server-side rendering for all public pages
- Dynamic `generateMetadata()` per book page
- JSON-LD structured data (Book, Product, Offer)
- Auto-generated `sitemap.xml` with all books
- `robots.txt` blocking admin/API routes
- OpenGraph + Twitter card metadata
- Slug-based SEO URLs (`/books/python-for-beginners`)
- Semantic H1 structure on all pages
