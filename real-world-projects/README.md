# Real-World Projects

## 🎯 Purpose

These projects demonstrate **production-grade** engineering:
- Architecture decisions with tradeoffs
- Performance optimization
- Accessibility compliance
- Comprehensive testing
- Monitoring and observability

**Not toy projects.** These belong in your portfolio.

## 📦 Projects

### 1. [E-commerce Platform](1-ecommerce-platform/)
**Complexity:** Intermediate

**Features:**
- Product catalog with filtering/sorting
- Shopping cart with persistence
- Checkout flow with validation
- User authentication
- Order history

**Demonstrates:**
- State management at scale
- Form handling and validation
- Optimistic UI updates
- Payment integration
- SEO optimization

**Tech Stack:**
- Next.js (SSR for product pages)
- Zustand (cart state)
- React Query (server state)
- Stripe (payments)
- Playwright (E2E tests)

---

### 2. [Analytics Dashboard](2-analytics-dashboard/)
**Complexity:** Advanced

**Features:**
- Real-time metrics visualization
- Complex data tables (sortable, filterable)
- Custom date range selection
- Export to CSV/PDF
- User permissions

**Demonstrates:**
- Data visualization (Charts.js/D3)
- Virtualization (large datasets)
- Real-time updates (WebSockets)
- Performance optimization
- Role-based access control

**Tech Stack:**
- React + Vite
- TanStack Table
- Recharts
- Socket.io
- MSW (API mocking)

---

### 3. [Design System Library](3-design-system-library/)
**Complexity:** Advanced

**Features:**
- Component library (buttons, inputs, modals)
- Design tokens (colors, spacing, typography)
- Documentation site
- Versioning and changelog
- NPM publishing

**Demonstrates:**
- Component API design
- Monorepo setup (Turborepo)
- Storybook documentation
- Semantic versioning
- Package management

**Tech Stack:**
- React + TypeScript
- Turborepo (monorepo)
- Storybook
- Changesets (versioning)
- Chromatic (visual testing)

## 🏗️ Project Structure

Each project includes:

```
project-name/
├── README.md              # Overview, setup, decisions
├── requirements.md        # Functional & non-functional
├── architecture/
│   ├── decisions.md       # ADRs (Architecture Decision Records)
│   ├── data-flow.md       # State management strategy
│   └── diagrams/          # Architecture diagrams
├── src/                   # Source code
├── tests/                 # Test suites
├── docs/                  # Additional documentation
└── package.json
```

## 📋 Quality Checklist

Every project must have:

**Code Quality:**
- [ ] TypeScript strict mode
- [ ] ESLint + Prettier configured
- [ ] No console.log in production
- [ ] Meaningful variable names

**Testing:**
- [ ] >80% test coverage
- [ ] Unit tests for utilities
- [ ] Integration tests for features
- [ ] E2E tests for critical flows

**Performance:**
- [ ] Lighthouse score >90
- [ ] Bundle size <300KB (main)
- [ ] LCP <2.5s
- [ ] No memory leaks

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] WCAG 2.1 AA compliant
- [ ] Color contrast passing

**Production Readiness:**
- [ ] Error boundaries
- [ ] Loading states
- [ ] Empty states
- [ ] Error messages
- [ ] Logging/monitoring setup

## 🚀 Getting Started

1. Choose a project based on your interests
2. Read the requirements thoroughly
3. Review the architecture decisions
4. Set up the development environment
5. Build iteratively (MVP first)
6. Test continuously
7. Deploy and monitor

## 💡 Tips for Success

### Start Simple
Build the MVP first. Add features iteratively.

### Document Decisions
Write ADRs for major architectural choices.

### Test Early
Don't wait until the end to write tests.

### Deploy Often
Use Vercel/Netlify for continuous deployment.

### Measure Performance
Set up Lighthouse CI from day one.

## 📊 Evaluation Criteria

Your project will be judged on:

**Architecture (30%):**
- Clean code organization
- Sensible component structure
- Appropriate patterns used

**Functionality (25%):**
- Features work as expected
- Edge cases handled
- Good UX

**Testing (20%):**
- Comprehensive coverage
- Good test quality
- E2E coverage of flows

**Performance (15%):**
- Fast load times
- Smooth interactions
- Optimized assets

**Documentation (10%):**
- Clear README
- Architecture explained
- Setup instructions

## 🎓 Showcase Your Work

After completing:
- Deploy to production
- Write a blog post explaining decisions
- Record a demo video
- Add to resume/portfolio
- Share on Twitter/LinkedIn

---

**Ready to build? Start with [E-commerce Platform →](1-ecommerce-platform/)**
