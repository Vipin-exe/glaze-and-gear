Glaze & Gear — Current Features Documentation
This document outlines all the robust features, systems, and architectural patterns currently implemented in the Glaze & Gear e-commerce platform.

🛍️ 1. Customer Frontend & Shopping Experience
Dynamic Homepage: Features a premium hero section, category spotlights ("Gears for Him"), occasion-based collections, and a responsive product grid.
Product Listing & Filtering: A dedicated /products page with interactive tabs to filter items by category (e.g., Glaze Collection vs Gear Collection).
Product Detail Page (PDP): Dynamic routing (/product?id=...) showing large imagery, descriptions, and functional "Add to Cart" / "Buy Now" capabilities.
Skeleton Loading UX: High-quality UI/UX animations where content blocks pulse gracefully in the shape of the upcoming data while products load from the database.
Interactive Cart:
Syncs via localStorage allowing cross-tab cart updates.
Features real-time Quantity Controls (+ / - buttons) and Remove functionality.
Auto-calculates total order amount instantly.
💳 2. Payment & Core Ecommerce Systems
Razorpay Integration: End-to-end secure payment gateway implementation.
Server-side Order ID generation to prevent frontend price spoofing.
Beautiful Razorpay checkout overlay directly on the cart page.
Server-side cryptographic signature verification (crypto.createHmac) upon payment completion.
Automated Stock Decrement: The moment a payment is verified as successful by Razorpay, the database automatically loops through the purchased items and decrements the global stock levels.
Order Confirmation Emails: Immediately upon successful payment verification, the system uses NodeMailer (SMTP) to dispatch a beautiful HTML receipt detailing the purchased items to the customer.
🔐 3. Authentication & Security (NextAuth)
Role-Based Access Control (RBAC): Users are divided into ADMIN and CUSTOMER roles. Next.js Middleware strictly protects the /admin routes from unauthorized access.
Credentials Auth: Standard Email & Password registration.
Email Verification Flow: New users receive a secure, tokenized verification link to their inbox before they are allowed to log in.
Forgot/Reset Password Flow: Secure, tokenized password recovery flow using bcrypt for password hashing.
Google OAuth: Pre-configured support for Google Login (awaiting client credentials in .env).
🛠️ 4. Admin Dashboard (/admin)
Product Inventory Management (CRUD):
Create: Admins can add products, specify stock limits, set categories, and mark items as "Featured".
Read: A detailed inventory table showing product images, stock status badges (Red/Yellow/Green based on count), and prices.
Update: "Edit Mode" smartly pre-fills data and skips Cloudinary re-uploads if the image isn't changed, saving bandwidth and storage.
Delete: One-click product removal.
Secure Cloudinary Integration: Image uploads bypass server storage. The frontend requests a cryptographic signature from our Next.js backend, then uploads the image directly to Cloudinary using secure, auto-compressing transformations.
Order Management System:
A comprehensive ledger of all transactions.
Displays customer shipping details, purchased item counts, and monetary amounts.
Interactive Status Management: Admins can use a dropdown menu on any order to instantly change its status (PENDING, SHIPPED, DELIVERED, CANCELLED), which immediately syncs with the database via a PATCH request.
⚙️ 5. Infrastructure & Tech Stack
Framework: Next.js App Router (React)
Database: MongoDB (Atlas)
ORM: Prisma Client
Styling: Tailwind CSS
Media: Cloudinary (Image Hosting & Compression)
Emails: NodeMailer (SMTP)
Payments: Razorpay Node SDK