# AR Assistant - Object Recognition Tool

## Overview

A mobile-first augmented reality (AR) assistant application designed for council workers to identify and receive guidance on handling waste bins, syringes, dog waste, and graffiti. The application uses QR code scanning to detect objects and provides context-specific information through an interactive chat interface with a glassmorphic design aesthetic.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, built using Vite as the build tool and development server.

**UI Component System**: The application uses shadcn/ui components built on top of Radix UI primitives, providing a comprehensive set of accessible, customizable components. The design system follows a "new-york" style variant with glassmorphic theming.

**Routing**: Client-side routing implemented with Wouter, a minimal routing library suitable for single-page applications.

**State Management**: 
- React Query (@tanstack/react-query) for server state management and data fetching
- React hooks for local component state
- No global state management library - state is primarily component-local or lifted to parent components

**Styling Approach**:
- Tailwind CSS for utility-first styling
- Custom CSS variables for theming (defined in index.css)
- Glassmorphic design system with backdrop filters, semi-transparent backgrounds, and layered visual effects
- Dark mode support through CSS custom properties
- Roboto font family as primary typeface

**Key UI Patterns**:
- Mobile-optimized viewport configuration with viewport-fit=cover for full-screen experience
- Glassmorphic cards with backdrop blur effects
- Object-specific accent colors (purple for graffiti, orange/red for syringes, brown for dog waste)
- Fixed positioning for camera overlay and chat interface
- Scroll areas for message lists

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript.

**Module System**: ES modules (type: "module" in package.json).

**Development Environment**: 
- Development server uses tsx for TypeScript execution
- Production build uses esbuild for bundling server code
- Vite middleware integration in development for hot module replacement

**API Structure**: 
- Routes prefixed with `/api`
- Centralized route registration in `server/routes.ts`
- Request/response logging middleware with JSON payload capture
- Raw body preservation for webhook/payment processing scenarios

**Session Management**: Infrastructure includes connect-pg-simple for PostgreSQL-backed session storage, though implementation is minimal in current codebase.

### Data Storage Solutions

**Database**: PostgreSQL via Neon Database (@neondatabase/serverless).

**ORM**: Drizzle ORM for type-safe database queries and schema management.

**Schema Location**: Shared schema definitions in `shared/schema.ts` for use across client and server.

**Migration Strategy**: Drizzle Kit for schema migrations with push-based workflow (db:push script).

**Current Data Model**:
- Users table with id (UUID), username (unique), and password fields
- Detection events table (detectionEvents) tracking AI detection attempts with objectType, confidence (0-100), source, confirmed status, and timestamp
- In-memory fallback storage implementation (MemStorage class) for development/testing

**Type System**: 
- Drizzle Zod integration for runtime validation
- Shared TypeScript interfaces for DetectedObject, ChatMessage, QuickAction, and ObjectData
- Type-safe insert schemas derived from database tables

### Camera and AR Features

**Camera Access**: Web APIs (navigator.mediaDevices.getUserMedia) with environment-facing camera preference for mobile AR use cases.

**Object Detection Methods**:
1. **QR Code Scanning** (html5-qrcode): Traditional QR code detection and processing
2. **AI-Powered Detection** (Gemini Vision API): Real-time object recognition using Google's Gemini 2.5 Flash multimodal model

**QR Code Detection Flow**:
1. User clicks "Scan QR Code" button
2. Scanner detects QR code containing object identifier
3. Application maps QR code to object data from static database (objectData.ts)
4. For Circle T logo: Opens full-screen iframe with Circle T Smart QnA chatbot
5. For other objects: Camera view activates with object indicator overlay and chat interface presents object-specific guidance and quick actions

**AI Object Detection Flow**:
1. User clicks "Detect Object (AI)" button
2. Camera view opens with DetectionOverlay component
3. User captures image via "Capture & Detect" button
4. Image sent to /api/detect endpoint with base64 encoding
5. Gemini Vision API analyzes image and returns objectType (graffiti/syringe/dog-poop/pen/circle-t-logo/water-bottle/unknown) with confidence score (0-100)
6. If confidence ≥60%: Shows confirmation dialog with detected object and confidence
7. If confidence <60%: Shows low confidence warning with manual selection option
8. If unknown object: Shows error message suggesting alternative methods
9. On user confirmation:
   - Circle T logo: Opens full-screen iframe with Circle T Smart QnA chatbot, stops camera stream
   - Other objects: Opens chat interface with object-specific guidance
10. Detection event logged to database for analytics (rounded confidence, known objects only)

**AI Integration Details**:
- Model: Gemini 2.5 Flash (via Replit AI Integrations)
- No API key required (billed to Replit credits)
- Rate limiting: 30 detections per 15 minutes per IP address
- Geolocation restricted: Melbourne, Australia only
- Confidence threshold: Auto-confirm ≥70%, manual confirm 60-69%, reject <60%
- Analytics: Logs all successful detections with rounded confidence values

**Object Database**: Static in-memory object definitions with pre-configured responses and quick actions for each object type (graffiti, syringe, dog waste, pen).

**Circle T Logo Detection**:
- When Circle T logo is detected via AI detection:
  - Confetti animation plays for 3 seconds using Circle T brand colors (#1E88E5, #4FC3F7, #81D4FA, #ffffff)
  - Detection UI remains visible (user must click "Select" button to proceed)
  - After clicking "Select", shows chat messages with "Chat with Circle T Smart Assistant" button
  - Button opens https://www.circlet.com.au/showcase/Smart-QnA/ in new browser tab
- When Circle T logo is detected via QR code:
  - Shows chat messages with "Chat with Circle T Smart Assistant" button (no confetti)
- Object label displays as "Circle T" (without "Logo" suffix)
- Chat header shows "Circle T" instead of "Circle T Logo"

### Authentication and Authorization

**Current State**: Minimal authentication infrastructure present (user schema, session storage setup) but not actively implemented in routes.

**Planned Approach**: Session-based authentication using PostgreSQL session store, though current implementation focuses on object detection features rather than user management.

### Design System

**Theme Management**: CSS custom properties with light/dark mode support via class-based switching.

**Color Palette**:
- Primary: Circle T Blue (hsl(200, 80%, 45%))
- Object-specific accents for visual categorization
- Glassmorphic elements with rgba backgrounds and backdrop filters
- Neutral base colors with varying opacity levels

**Component Patterns**:
- Card-based layouts with rounded corners (12-24px)
- Semi-transparent overlays (rgba(0, 0, 0, 0.3-0.6))
- Backdrop blur effects (blur(12-20px))
- Elevation system using box shadows
- Responsive typography hierarchy

### Mobile Optimization

**Viewport Configuration**: 
- Maximum scale locked to prevent zoom
- Viewport-fit: cover for notch/safe area handling
- Apple mobile web app capable for standalone experience
- Black-translucent status bar style

**Touch Interactions**:
- Overscroll behavior disabled
- Webkit overflow scrolling optimized
- Touch-friendly button sizes and spacing

**Performance Considerations**:
- Vite's runtime error overlay for development
- Replit-specific plugins for development experience
- Lazy loading and code splitting via Vite