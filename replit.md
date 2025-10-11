# Kemet Services - Pharmacy Training Platform

## Overview

Kemet Services is a professional training and consulting platform for pharmacy operations in Côte d'Ivoire. It provides specialized training courses and consulting services to optimize pharmacy operations, reduce stock discrepancies, and improve performance. The platform features a React-based frontend for course management, consulting services, testimonials, and professional branding.

The platform also includes "Kemet Echo," a customer satisfaction survey web application for pharmacies and clinics, offering CSAT and NPS metrics, anonymous surveys, real-time analytics, and automated reporting across freemium, premium, and turnkey tiers.

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
- **Training Courses**: Categorized course system (Quality, Finance, Stock, HR, Auxiliaries)
- **Consulting Services**: Multi-step consulting process
- **Results Showcase**: KPI tracking and testimonial management
- **Asset Management**: Professional image gallery and brand assets
- **Kemet Echo Product Page**: Dedicated page with features, pricing, and demo request form.

### Online Training Platform
- **Learning Management System**: Enrollment system with authentication, course catalog, user dashboard, course completion badges.
- **Authentication**: Replit Auth integration with OIDC (Google, GitHub, Email/Password), session management.
- **Email Workflows**: Enrollment confirmations, weekly progress tracking, automated notifications.
- **Wave Mobile Money Payment System**: FCFA payment integration for Côte d'Ivoire and Senegal, with checkout, webhook processing, and payment status polling.
- **Admin CRUD Interface**: Dashboard for managing courses, modules, lessons, quizzes, and quiz questions with full CRUD operations, validation, and authorization.
- **Lesson Viewer**: Video integration (YouTube), content rendering with ReactMarkdown, progression tracking, and navigation (TOC, next/previous buttons).

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