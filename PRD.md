# Product Requirements Document (PRD)
**Project Name:** VO & Script Generator SaaS
**Type:** Web Application (SaaS)
**Description:** Aplikasi generator naskah video TikTok/Reels berbasis AI dengan sistem kredit prabayar. Memiliki fitur scraping URL produk untuk konteks AI, serta sistem pembayaran otomatis (Midtrans QRIS) dan manual.

---

## 1. Rules & Instructions for AI Agent
As an AI coding agent, strictly follow these rules when developing this project:
1. **Tech Stack Strictness:** Only use the technologies listed in the "Tech Stack" section. Do not introduce alternatives without user permission.
2. **App Router:** Strictly use Next.js App Router (`app/` directory). Do not use the Pages router.
3. **TypeScript:** Write all logic in TypeScript (`.ts`, `.tsx`). Define proper types/interfaces.
4. **Step-by-Step Execution:** Do not attempt to build the entire app in one prompt. Follow the "Implementation Phases" sequentially. Always ask the user for confirmation before moving to the next phase.
5. **UI/UX:** Replicate the provided dark mode UI design using Tailwind CSS. Use clean, modern component structures.

---

## 2. Tech Stack Definition
*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + Lucide React (Icons)
*   **Database:** PostgreSQL
*   **ORM:** Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
*   **Authentication:** Better Auth (`better-auth`) with Drizzle adapter.
*   **AI Provider:** Google Gemini API / OpenAI API (configurable via `.env`).
*   **Web Scraping:** Cheerio (`cheerio`) for parsing product URLs.
*   **Payment Gateway:** Midtrans Node.js SDK (`midtrans-client`).
*   **Storage:** Supabase Storage (or equivalent for manual transfer proof upload).

---

## 3. Database Schema (Drizzle ORM)
The database must include the following core tables:

### `users` table (Extended from Better Auth)
*   `id` (text, pk)
*   `name` (text)
*   `email` (text, unique)
*   `emailVerified` (boolean)
*   `image` (text, nullable)
*   `role` (text, default: "user") -> Can be "user" or "admin"
*   `credits` (integer, default: 0) -> Tracks available AI generation credits
*   *(Standard Better Auth timestamps)*

### `transactions` table (Custom for SaaS)
*   `id` (text, pk)
*   `userId` (text, fk -> users.id)
*   `amount` (integer) -> e.g., 50000
*   `creditsAdded` (integer) -> e.g., 100
*   `method` (text) -> "midtrans_qris" or "manual_transfer"
*   `status` (text) -> "pending", "success", "failed"
*   `proofUrl` (text, nullable) -> Link to uploaded receipt (for manual)
*   `createdAt` (timestamp)

*(Include standard Better Auth tables: `session`, `account`, `verification`).*

---

## 4. Authentication & Role Management
*   **Method:** Email and Password via Better Auth.
*   **Seed Data Requirement:** Must create a seeding script to inject two dummy accounts on initialization:
    *   **User:** `email`: user@generator.com | `password`: @Pasword123 | `role`: user | `credits`: 100
    *   **Admin:** `email`: admin@generator.com | `password`: @Pasword123 | `role`: admin | `credits`: 9999
*   **Middleware Logic:**
    *   `/generator` -> Requires authenticated user.
    *   `/admin` -> Requires authenticated user AND `role === 'admin'`.

---

## 5. Core Features & App Flow

### A. AI Generator Module (`/generator`)
1. **Input Handling:** UI includes inputs for Product URL, Tone/Style, Target Audience, Video Duration, and toggles (B-Roll, Q&A, Hook).
2. **Pre-generation Validation:** Before executing, check if `user.credits > 0`. If 0, block generation and prompt user to top-up.
3. **URL Scraping API:** Send the Product URL to an internal Next.js API route. Use Cheerio to fetch `<title>` and `<meta name="description">` to get product context.
4. **Prompt Engineering:** Combine UI inputs and scraped product data into a structured system prompt.
5. **AI API Call:** Send the prompt to the AI provider.
6. **Post-generation:** Receive AI text, display it to the UI (with a copy button), and deduct `1` from `user.credits` in the database.

### B. Payment & Subscription Module
1. **Pricing Page UI:** Show package options (e.g., 50 Credits for Rp 25.000).
2. **Midtrans QRIS Flow (Auto):**
    *   User selects "Midtrans".
    *   Backend calls Midtrans Snap API.
    *   Frontend shows Midtrans Pop-up/QR Code.
    *   **Webhook (`/api/webhooks/midtrans`):** Listens for payment success. Automatically updates `transactions.status` to "success" and increments `users.credits`.
3. **Manual Transfer Flow:**
    *   User selects "Manual".
    *   UI shows bank details.
    *   User uploads proof image.
    *   Create transaction with `status: pending` and save `proofUrl`.

### C. Admin Dashboard Module (`/admin`)
1. **Transaction Management:** View all transactions.
2. **Manual Approval Action:** Admin can click "Approve" on pending manual transactions. This action updates transaction status and increments the specific user's credits.
3. **User Management:** Admin can manually add/deduct credits for any user.

---

## 6. Implementation Phases for AI Agent

**Phase 1: Project Setup & Auth Foundation**
*   Initialize Next.js App Router with Tailwind and TypeScript.
*   Setup Drizzle ORM and connect to PostgreSQL.
*   Setup Better Auth with standard tables + custom columns (`role`, `credits`).
*   Create the database seeding script for dummy user and admin.
*   Implement Next.js middleware for route protection.

**Phase 2: UI Slicing (Frontend)**
*   Build the main Dashboard Layout (Sidebar/Navbar).
*   Slice the Generator UI (Input forms, dropdowns, toggles, text result area) matching the dark mode reference.
*   Slice the Pricing/Top-up UI.

**Phase 3: AI Engine & Scraping (Backend logic)**
*   Build API route for Cheerio web scraping.
*   Build API route for AI Generation.
*   Implement the credit deduction logic within the AI API route.
*   Connect Frontend Generator UI to the Backend APIs.

**Phase 4: Payment Gateway & Admin**
*   Integrate Midtrans SDK and create the checkout API & Webhook handler.
*   Implement file upload for manual payments.
*   Build Admin Dashboard UI and backend actions for approving manual payments.

---
**End of PRD**