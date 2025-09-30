# Kemet Services - Pharmacy Training Platform

## Overview

Kemet Services is a professional training and consulting platform specifically designed for pharmacy operations in Côte d'Ivoire. The application provides specialized training courses and consulting services to help pharmacy owners and staff optimize their operations, reduce stock discrepancies, and improve overall performance.

The platform features a modern React-based frontend with comprehensive course management, consulting services, testimonials, and professional branding designed to build trust and demonstrate expertise in the pharmaceutical industry.

**New Product - Kemet Echo**: A customer satisfaction survey web application for pharmacies and clinics, featuring CSAT and NPS metrics, anonymous surveys, real-time dashboard analytics, and automated reporting. Available in three tiers: Freemium (30-day trial), Premium subscription (15,000 FCFA/month), and turnkey packages with tablet hardware, installation, and training.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom design system featuring teal primary colors, professional typography (Inter + Source Serif 4), and sophisticated spacing
- **State Management**: TanStack React Query for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Server**: Express.js with TypeScript for API routes
- **Development**: Hot module replacement with Vite integration for seamless full-stack development
- **Storage**: In-memory storage interface with extensible design for easy database integration
- **Middleware**: Request logging, JSON parsing, and error handling middleware

### Component Design System
- **Layout**: Responsive grid system with mobile-first approach
- **Cards**: Elevated design with subtle shadows and rounded corners
- **Navigation**: Sticky header with professional branding and clear call-to-actions
- **Interactive Elements**: Hover effects, smooth transitions, and micro-animations
- **Accessibility**: Focus states, ARIA labels, and keyboard navigation support

### Data Storage Design
- **Database ORM**: Drizzle ORM with PostgreSQL schema definitions
- **Type Safety**: Full end-to-end type safety with Zod schema validation
- **Migrations**: Database migration system with Drizzle Kit

### Content Architecture
- **Training Courses**: Categorized course system (Quality, Finance, Stock, HR, Auxiliaries)
- **Consulting Services**: Multi-step consulting process with clear timelines
- **Results Showcase**: KPI tracking and testimonial management
- **Asset Management**: Professional image gallery and brand assets
- **Kemet Echo Product Page**: Dedicated product page with features showcase, pricing tiers, and demo request form with email notifications

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle ORM**: Modern TypeScript-first ORM for database operations
- **Connection Management**: Environment-based database URL configuration

### UI Components & Styling
- **Radix UI**: Comprehensive collection of accessible, unstyled UI components
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Modern icon library with consistent styling
- **Google Fonts**: Inter and Source Serif 4 for professional typography

### Development Tools
- **Vite**: Fast build tool with Hot Module Replacement
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds

### Communication Services
- **WhatsApp Integration**: Direct messaging links for customer communication
- **Email Integration**: Gmail SMTP integration with Nodemailer for automated notifications
  - Training registration confirmations sent to participants
  - Admin notifications for training registrations
  - Kemet Echo demo request notifications to admin team
  - All emails sent from infos@kemetservices.com business email

### Image Assets
- **Professional Photography**: Training session photos and testimonials
- **Brand Assets**: Logo variants and professional imagery
- **Placeholder System**: Development-ready image placeholders

### Deployment Platform
- **Replit**: Cloud-based development and deployment platform
- **Environment Configuration**: Production and development environment separation

## Recent Changes (September 30, 2025)

### Kemet Echo Integration
- **Database Schema**: Created `kemet_echo_requests` table to store demo requests with fields for contact information, pharmacy name, offer type (freemium/premium/pack), and consent tracking
- **API Endpoint**: Implemented POST `/api/kemet-echo-requests` route with Zod validation and automated email notifications
- **Email Notifications**: Created `sendKemetEchoNotification()` function in gmail.ts with professional HTML templates matching brand design
- **Frontend Page**: Built comprehensive `/kemet-echo` page featuring:
  - Hero section with product introduction and key features
  - Detailed features showcase (CSAT, NPS, anonymous surveys, dashboard, alerts, reports)
  - Three pricing tiers with clear feature breakdowns
  - "Why Choose" section highlighting ease of use, security, and local support
  - Demo request form with full validation and GDPR consent
- **Navigation**: Added "Kemet Echo" link to main navigation menu between Galerie and Consulting
- **SEO**: Implemented meta tags and descriptions for Kemet Echo page

### Technical Implementation
- Uses existing teal design system and shadcn/ui components for brand consistency
- Follows established patterns for form handling, validation, and error management
- Integrates with existing Gmail notification infrastructure with file-logging fallback
- Maintains GDPR compliance with explicit data consent requirements
- HTML escaping implemented in all email notifications to prevent injection attacks
- Professional email templates without emojis for brand consistency
- End-to-end tested and production-ready

### Database Setup Note
The `kemet_echo_requests` table must exist in the database. If not present, create it using:
```sql
CREATE TABLE IF NOT EXISTS kemet_echo_requests (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  pharmacy_name text NOT NULL,
  offer_type text NOT NULL,
  message text,
  data_consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'nouveau',
  assigned_to varchar,
  notes text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
```