# Intermediate Bootcamp - Software Setup

## Required Setup (From Beginner)

If you haven't already:
- [ ] Node.js 18+
- [ ] VS Code (or preferred editor)
- [ ] Chrome with React DevTools
- [ ] Git configured

See [Beginner software.md](../beginner-bootcamp/software.md) for details.

## Additional Tools for Intermediate

### 1. React DevTools
**Browser extension for debugging React**
- Chrome: [Install from Web Store](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- Firefox: [Install from Add-ons](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

**Essential for:**
- Component tree inspection
- Props/state debugging
- Performance profiling

### 2. Testing Tools
We'll install these in Module 5, but verify Node.js setup:
```bash
node --version  # v18+
npm --version   # 8+
```

### 3. VS Code Extensions (Additional)
Install these for intermediate work:
- **TypeScript**
- **ESLint**
- **Prettier**
- **Jest** (for testing)
- **GitLens** (advanced git features)
- **Import Cost** (see bundle impact)

### 4. Chrome Extensions
- **React DevTools** (required)
- **Redux DevTools** (if using Redux)
- **Lighthouse** (performance auditing)
- **Web Vitals** (performance monitoring)
- **Axe DevTools** (accessibility testing)

## Project Setup Template

For each module, we'll use this structure:

```bash
# Create new project
npm create vite@latest my-project -- --template react-ts
cd my-project
npm install

# Install common dependencies
npm install zustand react-query

# Install dev dependencies
npm install -D @testing-library/react @testing-library/jest-dom vitest
```

## Optional Tools

### Performance
- **Lighthouse CI** - Automated performance testing
- **Bundle Analyzer** - Webpack bundle visualization

### Debugging
- **Chrome DevTools** - Performance profiler
- **React DevTools Profiler** - React-specific profiling

### Design
- **Figma** - Design tool (free tier)
- **Storybook** - Component documentation

## Verify Setup

Run this script to check everything:

```bash
# Check Node.js
node --version

# Check npm
npm --version

# Test React DevTools
# Open https://react.dev in Chrome
# Open DevTools → should see "Components" and "Profiler" tabs

# Create test project
npm create vite@latest test-setup -- --template react-ts
cd test-setup
npm install
npm run dev

# Visit http://localhost:5173
# You should see Vite + React running
```

## Troubleshooting

### React DevTools not showing
- Make sure you're on a React site
- Try refreshing the page
- Check Chrome extensions are enabled

### Vite errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version
- Try `npm cache clean --force`

### TypeScript errors
- Ensure TypeScript is installed globally: `npm install -g typescript`
- Check `tsconfig.json` exists in project

---

**Setup complete? Start learning: [Module 1: React Core](1-react-core/) →**
