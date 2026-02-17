# Smart Bookmark App

A simple real-time bookmark manager built using Next.js (App Router) and Supabase.

## 🚀 Live Demo

https://smart-bookmark-drab.vercel.app

## 📂 GitHub Repository

https://github.com/swatidurgekar/smart-bookmark

---

## 🛠 Tech Stack

- Next.js (App Router)
- Supabase
  - Authentication (Google OAuth)
  - PostgreSQL Database
  - Row Level Security (RLS)
  - Realtime Subscriptions
- Tailwind CSS
- Vercel (Deployment)

---

## ✨ Features

- Google OAuth login (no email/password)
- Private bookmarks per user
- Add bookmark (title + URL)
- Delete bookmark
- Real-time updates across tabs (no refresh required)
- Secure backend using Row Level Security
- Protected dashboard route

---

## 🔐 Authentication

Authentication is handled via Supabase using Google OAuth only.

After login, the session is automatically established and users are redirected to the dashboard.

---

## 🗄 Database Design

### Table: `bookmarks`

| Column      | Type      | Description                     |
|-------------|----------|----------------------------------|
| id          | uuid     | Primary key                      |
| user_id     | uuid     | References auth.users(id)        |
| title       | text     | Bookmark title                   |
| url         | text     | Bookmark URL                     |
| created_at  | timestamp| Auto-generated                   |

---

## 🔒 Security (Row Level Security)

RLS is enabled on the `bookmarks` table.

Policies ensure:

- Users can only insert bookmarks where `auth.uid() = user_id`
- Users can only view their own bookmarks
- Users can only delete their own bookmarks

This guarantees that User A cannot access User B's data.

---

## ⚡ Real-Time Updates

Supabase Realtime subscriptions are used to listen for:

- INSERT
- DELETE
- UPDATE

changes on the `bookmarks` table.

If two tabs are open, adding a bookmark in one tab immediately updates the other without refresh.

---

## 🧠 Challenges Faced & Solutions

### 1️⃣ Environment Variables Not Loading

**Issue:** `supabaseUrl is required` error.

**Solution:**  
The `.env.local` file was incorrectly named and environment variables were missing the `NEXT_PUBLIC_` prefix.  
Renamed file correctly and restarted the development server.

---

### 2️⃣ OAuth Not Redirecting Properly

**Issue:** After login, user was not redirected to dashboard.

**Solution:**  
Implemented `onAuthStateChange` listener to detect session changes and redirect users after successful authentication.

---

### 3️⃣ Unsupported Provider Error

**Issue:** `Unsupported provider: provider is not enabled`.

**Solution:**  
Google provider was not fully enabled in Supabase. Ensured toggle was ON and credentials were saved properly.

---

### 4️⃣ Real-time Not Triggering

**Issue:** Realtime subscription was not working across tabs.

**Solution:**  
Enabled Realtime replication for the `bookmarks` table in Supabase and ensured proper subscription setup using `postgres_changes`.

---

### 5️⃣ Secure Data Isolation

**Issue:** Needed to ensure bookmarks were private per user.

**Solution:**  
Enabled Row Level Security and created strict policies using `auth.uid()`.

---

## 🏗 Architecture Decisions

- Used App Router for modern Next.js routing.
- Client-side Supabase for simplicity and real-time handling.
- RLS for backend-level data protection instead of frontend filtering.
- Simple Tailwind styling to focus on functionality and correctness.

---

## 📦 Deployment

Deployed on Vercel.

Environment variables were added in Vercel project settings:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Production domain was added to:

- Supabase URL Configuration
- Google OAuth Authorized Origins

---
