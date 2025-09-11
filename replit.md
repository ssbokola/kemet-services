# Kemet Services - Pharmacy Training Platform

## Overview

Kemet Services is a professional training and consulting platform specifically designed for pharmacy operations in Côte d'Ivoire. The application provides specialized training courses and consulting services to help pharmacy owners and staff optimize their operations, reduce stock discrepancies, and improve overall performance.

The platform features a modern React-based frontend with comprehensive course management, consulting services, testimonials, and professional branding designed to build trust and demonstrate expertise in the pharmaceutical industry.

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
- **Email Integration**: mailto links for professional contact

### Image Assets
- **Professional Photography**: Training session photos and testimonials
- **Brand Assets**: Logo variants and professional imagery
- **Placeholder System**: Development-ready image placeholders

### Deployment Platform
- **Replit**: Cloud-based development and deployment platform
- **Environment Configuration**: Production and development environment separation