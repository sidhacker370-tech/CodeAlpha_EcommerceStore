# CodeAlpha E-Commerce Store

A premium, full-stack E-Commerce web application built with a Node.js/Express.js backend, MongoDB database, and a responsive Single Page Application (SPA) frontend in Vanilla JavaScript and CSS. 

This project was built as part of an internship project for **CodeAlpha** and features a simulated payment gateway sandbox with automated order confirmation .

---

## 🚀 Key Features

* **User Authentication**: Secure register, login, profile management, and logout using JSON Web Tokens (JWT) stored client-side and verified via Express middleware.
* **Product Catalog**: Live product displays in Indian Rupees (INR) with real-time category filtering and dynamic search.
* **Shopping Cart State**: Cart updates and persists in `localStorage` across page refreshes. 
* **Safe Checkouts**: Backend verification that re-fetches and calculates totals directly from the database to prevent client-side price tampering.
* **Sandbox Payment Gateway Prototype**:
  * **Card Checkout**: Real-time credit card mock visualization that formats card numbers, identifies card providers (Visa, MasterCard, Amex), and flips to show the CVV block.
  * **UPI QR Scanner**: Simulated scan overlay with scanning laser animations.
  * **35-Second Bank Latency**: Simulates real-world bank handshake delays with dynamic progress descriptions.
* **Dynamic Status Auto-Updates**: Online paid orders start as `Processing`. Once on the Orders page, the client-side SPA runs a silent background poller that automatically updates the status badge to `Confirmed` when the server's 35-second timer transitions the order in the database.
* **Styled HTML Invoices**: Automatic dispatch of elegant HTML invoices with a full cost breakdown (Subtotal, GST, Delivery Fee, Totals) sent via `nodemailer` (SMTP or mock developer Ethereal Mail).

---

## 🛠️ Technology Stack

* **Frontend**: HTML5, Vanilla CSS3 (modern glassmorphism design), Vanilla JavaScript (ES6 SPA Router).
* **Backend**: Node.js, Express.js (REST APIs, CORS, JSON request parsers).
* **Database**: MongoDB & Mongoose ODM.
* **Security & Auth**: `jsonwebtoken` (JWT), `bcryptjs` (password hashing).
* **Mailing**: `nodemailer` for email dispatch.

---

## 📂 Project Structure

```text
CodeAlpha_EcommerceStore/
├── config/
│   └── db.js                 # MongoDB connection logic
├── controllers/
│   ├── authController.js     # Register, login, and user profile management
│   ├── productController.js  # Product fetch and category search filters
│   └── orderController.js    # Order checkout, history, and status timers
├── middleware/
│   ├── authMiddleware.js     # Bearer Token JWT check
│   └── errorMiddleware.js    # Centralized REST error handler
├── models/
│   ├── User.js               # User collection schema
│   ├── Product.js            # Product catalog collection schema
│   └── Order.js              # Order details schema (tracks statuses)
├── public/                   # Frontend SPA files
│   ├── css/
│   │   └── style.css         # Modern premium stylesheet
│   ├── js/
│   │   ├── api.js            # Axios-like Fetch wrapper for APIs
│   │   ├── auth.js           # Session and Token storage state
│   │   ├── cart.js           # Shopping cart math and local storage state
│   │   └── main.js           # SPA hash router, dynamic views, payment engine
│   └── index.html            # Main SPA HTML skeletal structure
├── routes/
│   ├── authRoutes.js         # /api/auth routes
│   ├── productRoutes.js      # /api/products routes
│   └── orderRoutes.js        # /api/orders routes
├── scripts/
│   └── seed.js               # Database seeder (seeds 13 catalog items)
├── utils/
│   └── sendEmail.js          # Nodemailer HTML template compiling & dispatch
├── .env                      # Application environment variables
├── .gitignore                # Excludes node_modules, .env, and local database files
├── package.json              # Server dependencies & command scripts
└── server.js                 # Application entry point
```

---

## ⚙️ Installation & Setup

### Prerequisites
* **Node.js** (v16+) installed.
* **MongoDB** installed.

### 1. Clone & Install Dependencies
Navigate to your project directory and run:
```bash
npm install
```

### 2. Configure Environment Variables (`.env`)
Create a `.env` file in the root directory and add the following:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/codealpha_store
JWT_SECRET=your_super_secret_jwt_token_key

# Optional SMTP Configurations (leave blank to use Ethereal mock mails)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### 3. Run MongoDB Local Server
If running MongoDB locally, make sure your daemon is active:
```powershell
# Create folder for DB inside project root
mkdir data/db

# Start mongod on port 27017
& "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath data/db --port 27017
```

### 4. Seed the Database
Initialize your products catalog with 13 premium products:
```bash
npm run seed
```

### 5. Start the Express Server
```bash
npm start
```
Your store is now live at: **[http://localhost:5000](http://localhost:5000)**!

---

## ⚡ API Endpoint documentation

### Authentication Routes (`/api/auth`)
* `POST /register` - Register a new user profile.
* `POST /login` - Sign in and get a JWT token.
* `GET /profile` - Retrieve logged-in user profile details (Protected).

### Product Routes (`/api/products`)
* `GET /` - Retrieve all products, categories, and filter catalogs.
* `GET /:id` - Retrieve specific details of a single product.

### Order Routes (`/api/orders`)
* `POST /` - Place a new order (Protected).
* `GET /` - Get all orders placed by the authenticated user (Protected).
* `GET /:id` - Get detail logs of a specific order (Protected).
