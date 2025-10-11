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

## Recent Changes

### Online Training Platform (October 11, 2025)
- **Learning Management System**: Complete enrollment system with authentication, course catalog, and user dashboard
- **Database Schema**: 
  - Enhanced `users` table with nullable username for OIDC compatibility
  - `courses` table with full course metadata (title, slug, description, category, level, duration, price, objectives, prerequisites)
  - `enrollments` table linking users to courses with progress tracking (status, progressPercent, enrolledAt)
  - `modules` table organizing lessons into structured learning paths with prerequisites
  - `lessons` table with video URLs, content, duration, and order tracking
  - `lesson_progress` table for granular lesson completion tracking
  - `quizzes` table for assessments with passing scores and certificate generation flags
  - `quiz_questions` table with multiple-choice questions and correct answers
  - `quiz_results` table storing user scores, attempts, and completion status
  - `resources` table for downloadable materials (PDFs, documents) linked to lessons/courses
  - `orders` table tracking Wave Mobile Money payments with waveCheckoutId and waveTransactionId
- **Authentication**: Replit Auth integration with OIDC (Google, GitHub, Email/Password)
  - Users can authenticate via /api/login
  - Session management with express-session
  - Protected routes with isAuthenticated middleware
- **API Endpoints**:
  - **Courses**: `GET /api/formations` (public catalog), `GET /api/formations/:id`, `POST /api/formations/:id/enroll`
  - **Modules**: `GET /api/modules/:moduleId` (auth + enrollment required)
  - **Lessons**: `GET /api/lessons/:lessonId` (auth + enrollment + progression lock)
  - **Quizzes**: `GET /api/quizzes/:quizId`, `POST /api/quizzes/:quizId/submit` (auth + enrollment required, answers masked)
  - **Payments**: `POST /api/payments/wave/checkout`, `POST /api/payments/wave/webhook`, `GET /api/payments/wave/status/:orderId`
  - **Admin**: `POST /api/admin/send-progress-emails` - Manual trigger for weekly emails
- **Email Workflows**:
  - Enrollment confirmation emails sent automatically on registration
  - Weekly progress tracking emails with personalized metrics
  - Generic `sendGmail` helper for centralized SMTP dispatch with fallback handling
  - All emails sent from infos@kemetservices.com
- **Frontend Pages**:
  - `/formations` - Course catalog with category filtering
  - `/formation/:slug` - Course detail page with enrollment functionality
  - `/mon-compte` - User dashboard displaying enrolled courses with progress bars
- **Key Features**:
  - Duplicate enrollment prevention
  - Real-time enrollment status updates
  - Progress tracking (0-100%)
  - Course completion badges
  - Responsive UI with Tailwind CSS and shadcn/ui components
- **Bug Fixes**:
  - Fixed route ordering in formations.ts (specific routes before generic /:id)
  - Made users.username nullable for OIDC flows
  - Corrected deleteCourse return value for accurate success reporting
- **Wave Mobile Money Payment System**: Complete FCFA payment integration for Côte d'Ivoire and Senegal
  - Country-specific Wave API endpoints via WAVE_COUNTRY env var (ci/senegal)
  - Checkout creation with redirect to Wave payment page
  - Webhook processing with HMAC signature verification and idempotent enrollment creation
  - Payment status polling for order verification
  - Automatic course unlocking on successful payment (creates enrollment)
  - Order tracking with waveCheckoutId and waveTransactionId
  - Security: All payment routes require authentication, webhook verifies signature/token, ownership validation on status checks
  - Environment variables: WAVE_API_KEY, WAVE_SECRET_KEY, WAVE_COUNTRY, PAYDUNYA_WEBHOOK_SECRET, APP_BASE_URL
- **Admin CRUD Interface**: Complete admin dashboard for managing all LMS content
  - **Admin Course Management** (`/admin/courses`):
    - Full CRUD for courses with validation and slug uniqueness
    - "Contenu" button navigates to AdminCourseContent for module/lesson management
  - **Admin Course Content** (`/admin/courses/:id/content`):
    - CRUD modules with title, description, order, prerequisites, isPublished
    - CRUD lessons with title, description, videoUrl, content, duration, order, isPublished
    - Accordion interface showing modules → lessons hierarchy
    - "Quiz" button on each lesson navigates to AdminQuizManager
    - Enriched API: GET /api/admin/courses/:id returns full structure with embedded quizzes in lessons and finalQuiz
  - **Admin Quiz Manager** (`/admin/lessons/:lessonId/quiz`):
    - CRUD quizzes with title, description, passingScore (0-100), timeLimit, maxAttempts, isFinalQuiz
    - CRUD quiz questions with questionText, questionType (multiple_choice/true_false/short_answer), options[], correctAnswer, explanation, points
    - Radio buttons for selecting correct answer in multiple choice questions
    - Expand/collapse interface for viewing questions per quiz
    - Automatic order management for quizzes and questions
  - **API Routes** (all protected with requireAdminAuth()):
    - Modules: POST/PUT/DELETE `/api/admin/modules`
    - Lessons: POST/PUT/DELETE `/api/admin/lessons`
    - Quizzes: GET `/api/admin/quizzes?lessonId=...` OR `?courseId=...`, POST/PUT/DELETE `/api/admin/quizzes`
    - Quiz Questions: GET `/api/admin/quiz-questions?quizId=...`, POST/PUT/DELETE `/api/admin/quiz-questions`
  - **Validation & Security**:
    - Quiz validation enforces exactly ONE association (lessonId XOR courseId, not both or neither)
    - Auth guard on all admin pages and API routes
    - AlertDialog confirmations for all delete operations
    - Cache invalidation on mutations for real-time UI updates
  - **UX Features**:
    - Intuitive navigation: Courses → Contenu → Quiz
    - Visual badges for published/draft status
    - Toast notifications for all actions
    - Complete data-testid attributes for testing
- **Security Enhancements**:
  - All lesson/module/quiz routes enforce authentication AND enrollment verification
  - Quiz answers masked (correctAnswer field removed from API responses)
  - Progression locking: lessons require completion of previous lessons via isLessonAccessible()
  - Webhook signature verification prevents unauthorized payment processing
  - Admin routes protected with requireAdminAuth() middleware
- **Testing**: End-to-end Playwright test validates complete enrollment flow from authentication to dashboard display

### Kemet Echo Integration (September 30, 2025)
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