# AR Object Recognition Chat App - Design Guidelines

## Design Approach

**System-Based Approach**: Material Design + Mobile AR Conventions
- Utility-focused mobile application for council workers in field conditions
- Prioritizes clarity, legibility, and quick information access
- High contrast overlays on camera feed for outdoor visibility
- Inspired by: Google Lens, Snapchat AR interfaces, WhatsApp camera UI

## Core Design Principles

1. **Visibility First**: All UI elements must be clearly visible over live camera feed
2. **One-Handed Operation**: Primary actions within thumb reach on mobile devices
3. **Instant Feedback**: Immediate visual confirmation for all interactions
4. **Minimal Cognitive Load**: Clear, action-oriented instructions

## Typography

**Font Stack**: System fonts for optimal mobile performance
- iOS: -apple-system, SF Pro
- Android: Roboto
- Fallback: sans-serif

**Hierarchy**:
- Object Labels: 28px, bold, high contrast with background blur
- Chat Messages: 16px, medium weight, line-height 1.5
- Instructions: 14px, regular weight
- Buttons/CTAs: 16px, semibold, uppercase

## Layout System

**Spacing Units**: Tailwind units of 2, 4, 8, and 16
- Consistent padding: p-4 for cards, p-2 for compact elements
- Generous tap targets: minimum 44px height for all interactive elements
- Chat bubbles: p-4 with rounded-2xl corners

**Camera Interface Layout**:
- Full viewport camera feed (100vh)
- Top overlay bar: Floating semi-transparent header with blur backdrop
- Bottom overlay: Chat interface anchored to bottom with safe-area-inset padding
- Floating action buttons: Positioned with 16px margins from edges

## Component Library

### Camera View Components

**QR Scanner Frame**:
- Centered square frame (280px × 280px on mobile)
- Animated corner brackets indicating scan area
- Semi-transparent dark overlay outside scan area (opacity 0.6)
- Pulsing animation on active corners

**Object Recognition Indicator**:
- Floating badge with object icon when detected
- Positioned top-center with backdrop blur
- Success state: Green accent with checkmark
- Scanning state: Blue with loading spinner

### AR Chat Overlay

**Chat Container**:
- Fixed to bottom of screen with rounded-t-3xl corners
- Backdrop blur with semi-transparent background (opacity 0.9)
- Maximum height: 60% of viewport for camera visibility
- Scrollable message area with fade gradient at top

**Message Bubbles**:
- System/Bot messages: Left-aligned, light background, rounded-2xl
- User prompts: Right-aligned (if interactive), accent background
- Spacing: 8px between messages, 16px padding inside bubbles
- Avatar icons: 32px circular for bot (council logo)

**Quick Action Chips**:
- Horizontal scrollable row of preset questions
- Pill-shaped buttons with 8px padding
- Positioned above text input area
- Examples: "What do I do?", "Disposal location", "Safety info"

### Navigation & Controls

**Header Overlay**:
- Semi-transparent bar with backdrop blur
- Left: Back/Close button (44px touch target)
- Center: Current object label or "Scanning..."
- Right: Info/Help icon
- Height: 64px with safe-area padding

**Action Buttons**:
- Primary: Large circular FAB (56px) for capture/scan
- Secondary: Smaller circular buttons (44px) for flashlight, flip camera
- Bottom-right positioning with 16px spacing

### Information States

**Loading/Scanning State**:
- Animated scanning line across QR frame
- Text: "Point camera at QR code" with pulsing animation
- Loading spinner in center when processing

**Object Detected State**:
- Object icon appears with scale-in animation
- Haptic feedback (if supported)
- Chat drawer slides up from bottom
- Greeting message: "Found: [Object Name]"

**Error State**:
- Red outline on scan frame
- Error message in top toast: "Unable to recognize. Try again."
- Retry button in center

## Mobile-Specific Patterns

**Safe Areas**: Respect iOS notch and Android navigation bars
- Use env(safe-area-inset-*) for all fixed elements
- Add 16px additional padding on bottom for gesture areas

**Touch Interactions**:
- Swipe down on chat to minimize/expand
- Tap outside chat to dismiss (returns focus to camera)
- Long-press on message to copy text

**Performance Considerations**:
- Minimize animations on camera feed
- Use transform and opacity for animations only
- Lazy load chat history if needed

## Object-Specific Visual Treatments

**Waste Bin**: Green accent, recycling icon
**Syringe**: Orange/Red accent, medical warning icon  
**Dog Poop**: Brown accent, pet waste icon

Each object uses its accent throughout the chat interface for visual consistency and quick recognition.

## Accessibility

- High contrast text (WCAG AAA for outdoor readability)
- Large touch targets (minimum 44px)
- Screen reader labels for all icons
- Alternative text mode if camera fails
- VoiceOver/TalkBack support for navigation

---

**Key Insight**: This is a functional tool, not a consumer app. Every design decision prioritizes speed, clarity, and ease of use in real-world field conditions where council workers need immediate, accurate information.