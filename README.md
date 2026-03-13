<div align="center">
  <img width="1200" alt="Aliseus Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  # Aliseus
  *>_ The Ultimate Personal Operating System for the Modern Era.*

  [![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://aliseus.app/)
  [![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
</div>

---

## 💎 The Vision

**Aliseus** is not just another dashboard; it is a **Personal Operating System** designed to centralize and elevate every aspect of your digital and physical life. Built with a "Privacy First" and "Aesthetics Matter" philosophy, it combines cutting-edge AI with a premium user interface to provide clarity in finance, home management, and personal growth.

## 🚀 Key Modules

### 🏦 Aura Finance
Master your economy with elite-level tools:
- **Timeline Evolution**: Visualize your net worth growth over years.
- **Smart Budgets & Fixed Payments**: Granular control over spending with automated category distribution and tracking of monthly recurring bills.
- **Debt & Subscription Tracker**: Keep your liabilities in check and never pay for forgotten subscriptions.
- **Finance Projections**: Advanced AI algorithms to predict your balance 12+ months ahead.
- **Accounts Hub**: A unified view of all your physical and digital assets.

### 🏠 Life Hub
Harmonize your household operations:
- **Intelligent Meal Planner**: Weekly organization with favorite recipe integration, Drag-and-Drop scheduling, and AI-powered smart menu generation.
- **Travel Hub**: Interactive maps, countdowns, and detailed planning for your upcoming trips.
- **Pantry Intelligence**: Inventory tracking for essential items to optimize shopping.
- **Family Agenda**: Synchronized schedule for the whole household with Realtime updates.
- **Habits & Tasks**: Build routines and track your daily progress seamlessly.

### 🧠 Aliseus Insights (AI)
Powered by **Google Gemini 1.5 Pro**, the suite provides proactive analysis:
- **Predictive Savings**: Tells you exactly when you'll hit your financial goals.
- **Spending Alerts**: Identifies anomalies in your monthly flow.
- **Contextual Tips**: Personalized suggestions based on your Life and Finance data.

## 🎨 Premium UX Features

- **Customizable Dashboard**: Drag-and-drop widget gallery with 60FPS animations powered by `framer-motion`.
- **Quick-Resize System**: Contextual controls to instantly toggle between KPI, Half, Wide, and Full layouts.
- **Adaptive Glassmorphism**: A design system that feels alive, featuring sub-pixel blurring and micro-interactions.
- **Multi-Language Elite**: Native support for **Español**, **English**, and **Français**.
- **Offline-First Hybrid State**: Robust local persistence powered by Zustand ensures lightning-fast load times and reliability.

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript 5.8, Vite |
| **State** | Zustand (Hybrid Local-First State Management) |
| **Animation** | Framer Motion |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions, Realtime) |
| **AI Engine** | Google Gemini 1.5 Pro |
| **Payments** | Stripe Integration (Billing & Subscriptions) |
| **Monitoring** | Sentry, Vercel Analytics |

## 📦 Getting Started

### Prerequisites
- Node.js 20+
- A Supabase Project
- A Google AI (Gemini) API Key
- A Stripe Account (For Subscriptions/Billing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/josuesantanamartin-max/aliseus.git
   cd aliseus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root based on `.env.example`:
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   VITE_GEMINI_API_KEY=your_gemini_key
   VITE_STRIPE_PUBLIC_KEY=your_stripe_key
   ```

4. **Launch Development Server**
   ```bash
   npm run dev
   ```

## 🛡 Security & Performance

- **End-to-End Type Safety** with TypeScript and Zod.
- **GDPR Compliant** cookie management and data export.
- **Optimized Core Web Vitals** via Vercel Edge performance.
- **Automated Testing** with Vitest and Playwright.

---

<p align="center">
  Built with ❤️ for a more organized future. <br/>
  <b>Aliseus © 2026</b>
</p>
