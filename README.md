# Piehands CRM - Frontend Dashboard

A modern, responsive web application for managing email campaigns and user analytics, built with React, TypeScript, and Tailwind CSS.

## 🚀 Core Mission

The frontend provides an intuitive interface for three key objectives:

1. **Mission-Critical Reliability**: Confident campaign management for 10,000+ email sends
2. **Effortless Automation**: Simple setup for event-driven email workflows  
3. **Intelligent Personalization**: Easy template editing with dynamic variables

## 🛠️ Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS v4 with custom design system
- **State Management**: React Query (TanStack Query) for server state
- **HTTP Client**: Axios for API communication
- **UI Components**: Radix UI primitives with custom styling
- **Forms**: React Hook Form with validation
- **Icons**: Lucide React icons
- **Development**: Storybook for component development

## 📋 Current Features

### ✅ Phase 1: Campaign Management Dashboard
- **Dashboard Overview**: Email activity metrics and recent campaigns
- **User Management**: 
  - User list with search and pagination
  - Bulk user import via CSV/JSONL upload
  - User detail pages with event history
  - Inline property editing
- **Template Management**: 
  - Template list with CRUD operations
  - Rich template editor with live preview
  - Variable autocomplete with user properties
  - Markdown and HTML support
- **Campaign Management**: 
  - Campaign list and creation flow
  - Canvas-based campaign editor
  - Manual campaign sending with target selection
  - Campaign analytics and performance tracking
- **Analytics Dashboard**: 
  - Email overview with delivery metrics
  - Campaign-specific analytics
  - User activity tracking
  - Real-time activity feeds

### 🔄 Phase 2: Automation Interface (In Progress)
- **Canvas Editor v1**: Visual workflow builder
- **Event Configuration**: Event-based trigger setup
- **Basic Automation**: Welcome email workflows

### 🎯 Phase 3: Advanced Features (Planned)
- **Advanced Canvas**: Conditional logic and time delays
- **Segmentation Builder**: Dynamic user grouping interface
- **AI Integration**: LLM-powered content generation
- **A/B Testing**: Template and campaign testing interface

## 🚦 Quick Start

### Prerequisites
- Node.js 18+
- Backend API running on http://localhost:3000

### Installation
```bash
npm install
```

### Development
```bash
# Start development server
npm run dev

# Open Storybook (component development)
npm run storybook

# Run type checking
npm run type-check

# Lint code
npm run lint
```

### Building
```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--color-primary: #3B82F6;      /* Blue-500 */
--color-primary-dark: #1E40AF; /* Blue-800 */

/* Status Colors */
--color-success: #10B981;      /* Emerald-500 */
--color-warning: #F59E0B;      /* Amber-500 */
--color-error: #EF4444;        /* Red-500 */

/* Neutral Colors */
--color-gray-50: #F9FAFB;
--color-gray-900: #111827;
```

### Typography
- **Font Family**: Inter (clean, modern, highly readable)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Scale**: Tailwind's default type scale

### Components
All components follow a consistent pattern:
- Compound component architecture where appropriate
- Props interface with TypeScript
- Tailwind CSS for styling
- Accessibility-first design
- Responsive by default

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

### Layout Strategy
- Mobile-first design approach
- Adaptive sidebar navigation
- Responsive data tables with mobile cards
- Touch-friendly interface elements

## 🔧 Component Architecture

### Core Components
```
src/components/
├── ui/           # Reusable UI primitives
│   ├── button.tsx
│   ├── modal.tsx
│   ├── input.tsx
│   └── ...
├── canvas/       # Campaign editor components
├── FileUpload.tsx
├── TemplateForm.tsx
├── SendCampaignModal.tsx
└── ...
```

### Pages Structure
```
src/pages/
├── DashboardPage.tsx      # Overview dashboard
├── UsersPage.tsx          # User management
├── UserDetailPage.tsx     # Individual user details
├── TemplatesPage.tsx      # Template management
├── CampaignsPage.tsx      # Campaign list
├── CampaignDetailPage.tsx # Campaign editor
└── AnalyticsPage.tsx      # Analytics dashboard
```

### Custom Hooks
```
src/hooks/
├── useApi.ts              # API client configuration
├── useCampaigns.ts        # Campaign data fetching
├── useUsers.ts            # User data management
└── useTemplates.ts        # Template operations
```

## 🌐 API Integration

### Base Configuration
```typescript
// API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})
```

### Data Fetching Patterns
- React Query for server state management
- Optimistic updates for better UX
- Error boundaries for graceful error handling
- Loading states with skeleton screens
- Infinite queries for pagination

## 🎭 User Experience Features

### Performance Optimizations
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle size optimization with Vite
- Efficient re-rendering with React.memo()

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- Focus management in modals
- High contrast color ratios
- Semantic HTML structure

### User Feedback
- Toast notifications for actions
- Loading skeletons during data fetch
- Form validation with clear error messages
- Confirmation dialogs for destructive actions

## 🧪 Development Tools

### Storybook Setup
```bash
# Run Storybook
npm run storybook

# Build static Storybook
npm run build-storybook
```

Stories are co-located with components:
```
src/components/ui/Button.stories.tsx
src/components/ui/Modal.stories.tsx
```

### Code Quality
- ESLint with React and TypeScript rules
- Prettier for consistent formatting
- TypeScript strict mode
- Husky for pre-commit hooks

## 🚀 Deployment

### Environment Variables
```env
# API Configuration
VITE_API_URL=https://api.piehands.com

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CANVAS_EDITOR=true
```

### Build Optimization
- Tree shaking for minimal bundle size
- Asset optimization with Vite
- CSS purging with Tailwind
- Modern browser targeting

### Static Hosting
Compatible with:
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## 📈 Analytics & Monitoring

### User Analytics
- Page view tracking
- User interaction events
- Performance metrics
- Error tracking

### Performance Monitoring
- Core Web Vitals tracking
- Bundle size monitoring  
- API response time tracking
- Error rate monitoring

## 🤝 Contributing

### Development Workflow
1. Create component in Storybook first
2. Implement with TypeScript and Tailwind
3. Add proper error handling and loading states
4. Write accessible markup
5. Test responsive behavior

### Code Standards
- TypeScript strict mode compliance
- Component props interfaces
- Consistent naming conventions
- Accessibility best practices
- Mobile-first responsive design

### Component Guidelines
- Single responsibility principle
- Composable and reusable design
- Proper prop drilling avoidance
- State management best practices

---

**Built with ❤️ for intuitive campaign management**
