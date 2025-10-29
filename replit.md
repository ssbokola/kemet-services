# Kemet Services - Pharmacy Training Platform

## Overview

Kemet Services is a professional training and consulting platform for pharmacy operations in Côte d'Ivoire. It provides specialized training courses and consulting services to optimize pharmacy operations, reduce stock discrepancies, and improve performance. The platform features a React-based frontend for course management, consulting services, testimonials, and professional branding.

The platform also includes "Kemet Echo," a customer satisfaction survey web application for pharmacies and clinics, offering CSAT and NPS metrics, anonymous surveys, real-time analytics, and automated reporting across freemium, premium, and turnkey tiers.

## Recent Changes

### October 29, 2025
- **Bootcamp Stock+ Special Event System**: Created dedicated landing page and registration system for intensive 4-Saturday training program
  - **Landing Page** (`/bootcamp-stock`): Promotional page with hero section, program details, 4 pricing tiers, registration form
  - **Database Schema**: New `bootcamp_registrations` table with attendance tracking, extended `orders.orderType` to include 'bootcamp'
  - **Pricing Tiers**:
    - Classic: 200,000 FCFA (1 person, pay-per-session)
    - Smart Pay: 160,000 FCFA (1 person, -20% upfront payment)
    - Team Pack: 170,000 FCFA/person (2+ people, -15%)
    - Max Boost: 136,000 FCFA/person (2+ people, -35% upfront payment)
  - **Security**: Server-side Zod validation, server-calculated pricing (client totalAmount ignored), participant count enforcement (1-10)
  - **Form UX**: Auto-reset participants to 2 when selecting Team Pack/Max Boost, conditional participants field visibility
  - **Payment Integration**: Wave Mobile Money via PayDunya SOFTPAY with graceful error handling
  - **Navigation**: Added "🔥 Bootcamp Stock+" link in Formations menu with visual highlight (bg-primary/5)
  - **API Route**: `/api/bootcamp-registrations` with full validation, order creation, Wave checkout initiation

### October 17, 2025
- **Pricing Update**: Standardized pricing across platform
  - Formations en ligne (online): **40.000 F CFA** (stored as 4.000.000 centimes in `price` field)
  - Formations en présentiel (onsite): **50.000 F CFA** (stored as 50.000 in `defaultPrice` field)
  - Sessions en présentiel: **50.000 F CFA** (stored as 50.000 in `pricePerPerson` field)
- **Price Formatting Functions**: Created two formatting utilities in `client/src/lib/utils.ts`
  - `formatPriceCFA(centimes)`: Converts centimes to FCFA (divides by 100) - used for online courses
  - `formatCFA(fcfa)`: Formats FCFA directly (no division) - used for onsite trainings and sessions
- **Navigation Enhancement**: Added dropdown menu "Formations" in header with two options
  - "Formations en Ligne" → /formations (1 formation LMS, 40.000 F CFA)
  - "Formations en Présentiel" → /formations-presentiel (32 formations, 50.000 F CFA)
- **RouterLink Component**: Created custom forwardRef component for SPA navigation with Radix NavigationMenu
  - Supports modifier keys (Ctrl/Cmd/Shift/Alt) for opening links in new tabs/windows
  - Preserves browser affordances while maintaining SPA routing

### October 15, 2025
- **Category System Update**: Extended category enum to include "pharmaciens" as the 6th category
- **Database Migration**: Updated all 10 PHAR-* onsite trainings to use category="pharmaciens" (previously using finance, quality, stock, hr)
- **UI Enhancement**: Added "Pharmaciens" filter button with teal badge styling (bg-teal-100/text-teal-800) on /formations-presentiel
- **Data Separation Fix**: Fixed critical bug where onsite trainings appeared in online catalog - `storage.getPublishedCourses()` now filters by `deliveryMode='online'`
- **Training Count**: Total of 20+ formations with category="pharmaciens" (includes PHAR-01 through PHAR-10 and others)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript and Vite
- **Routing**: Wouter
- **UI Framework**: shadcn/ui built on Radix UI
- **Styling**: Tailwind CSS with a custom design system (teal primary colors, Inter + Source Serif 4 typography)
- **State Management**: TanStack React Query for server state
- **Forms**: React Hook Form with Zod validation
- **Layout**: Responsive grid system with a mobile-first approach
- **Navigation**: Sticky header
- **Accessibility**: Focus states, ARIA labels, keyboard navigation

### Backend
- **Server**: Express.js with TypeScript
- **Development**: Hot module replacement with Vite
- **Storage**: In-memory storage interface, extensible for database integration
- **Middleware**: Request logging, JSON parsing, error handling

### Component Design System
- **Cards**: Elevated design with subtle shadows and rounded corners
- **Interactive Elements**: Hover effects, smooth transitions, micro-animations

### Data Storage
- **Database ORM**: Drizzle ORM with PostgreSQL schema definitions
- **Type Safety**: End-to-end type safety with Zod schema validation
- **Migrations**: Drizzle Kit for database migrations

### Content Architecture
- **Training Courses**: Categorized course system (Quality, Finance, Stock, HR, Auxiliaries, Pharmaciens) - Course level stratification removed as of October 2025
  - **Delivery Modes**: Online (LMS), Onsite (présentiel avec sessions programmées), Hybrid
  - **Onsite Training System**: 22 formations en présentiel (12 auxiliaires + 10 pharmaciens) with scheduled sessions, registration forms, and Wave Mobile Money payment integration
- **Consulting Services**: Multi-step consulting process
- **Results Showcase**: KPI tracking and testimonial management
- **Asset Management**: Professional image gallery and brand assets
- **Kemet Echo Product Page**: Dedicated page with features, pricing, and demo request form.

### Online Training Platform (LMS)
- **Learning Management System**: Enrollment system with authentication, course catalog, user dashboard, course completion badges.
- **Authentication**: Replit Auth integration with OIDC (Google, GitHub, Email/Password), session management.
- **Email Workflows**: Enrollment confirmations, weekly progress tracking, automated notifications.
- **Wave Mobile Money Payment System**: FCFA payment integration for Côte d'Ivoire and Senegal via PayDunya SOFTPAY, with checkout, webhook processing, and payment status polling.
- **Admin CRUD Interface**: Dashboard for managing courses, modules, lessons, quizzes, and quiz questions with full CRUD operations, validation, and authorization.
- **Lesson Viewer**: Video integration (YouTube), content rendering with ReactMarkdown, progression tracking, and navigation (TOC, next/previous buttons).

### Onsite Training Platform (Présentiel)
- **Session Management**: Scheduled in-person training sessions with date, venue, address, capacity, and pricing (FCFA).
- **Registration System**: Anonymous registration forms (no user account required) with participant details (name, email, phone, role, organization).
- **Training Catalog**: 
  - Route: `/formations-presentiel` - Displays all onsite trainings with upcoming sessions
  - Route: `/formation-presentiel/:slug` - Detailed training page with objectives, sessions list, and registration form
  - Route: `/calendrier-formations` - Calendar of all upcoming sessions with PDF export functionality
- **Payment Integration**: Wave Mobile Money via PayDunya SOFTPAY for session payments
  - Server-side price validation (prevents client tampering)
  - Anonymous orders (userId and courseId nullable in orders table)
  - Graceful error handling for missing Wave API configuration
- **Database Schema**:
  - `courses` table with `deliverymode='onsite'` for présentiel trainings
  - `training_sessions` table for scheduled sessions (sessionCode, venue, address, city, startDate, endDate, maxCapacity, pricePerPerson, status)
  - `session_registrations` table for participant registrations (nullable userId for anonymous signups)
  - `orders` table with nullable userId and courseId for anonymous transactions

### Security
- All lesson/module/quiz routes enforce authentication and enrollment verification.
- Quiz answers are masked from API responses.
- Progression locking requires completion of previous lessons.
- Webhook signature verification for payment processing.
- Admin routes are protected with `requireAdminAuth()` middleware.

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL database
- **Drizzle ORM**: TypeScript-first ORM

### UI Components & Styling
- **Radix UI**: Accessible, unstyled UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Google Fonts**: Inter and Source Serif 4

### Development Tools
- **Vite**: Fast build tool
- **TypeScript**: Type safety
- **ESBuild**: Fast JavaScript bundler

### Communication Services
- **WhatsApp Integration**: Direct messaging links
- **Email Integration**: Gmail SMTP integration with Nodemailer for automated notifications (e.g., training confirmations, Kemet Echo demo requests) from `infos@kemetservices.com`.

### Image Assets
- **Professional Photography**: Training session photos and testimonials
- **Brand Assets**: Logo variants and professional imagery

### Deployment Platform
- **Replit**: Cloud-based development and deployment platform