# Module 1: React Core

**Duration:** 2.5 weeks | **Level:** Intermediate  
**Prerequisites:** JavaScript Fundamentals, Browser Basics, TypeScript Basics (Modules 1–4)

## Overview

You've used React. This module teaches you how React *works* — the reconciliation algorithm, the Fiber architecture, the rules that hooks enforce and why, how concurrent features change execution order, and the patterns that compose components at scale. After this module you'll debug React performance problems confidently, design component APIs that are impossible to misuse, and understand what happens between your JSX and the DOM.

## Learning Objectives

By the end of this module you will be able to:

- **Explain** React's Fiber architecture and how reconciliation decides what to re-render
- **Write** custom hooks that correctly encode async lifecycles, subscriptions, and derived state
- **Design** compound component, render prop, and HOC patterns with proper TypeScript types
- **Use** `useContext` + `useReducer` to build scalable state without external libraries
- **Control** imperative DOM with `useRef` and `useImperativeHandle`
- **Implement** Suspense boundaries and `use()` for concurrent data fetching
- **Profile** and fix performance bottlenecks using React DevTools Profiler

## Module Structure

```
1-react-core/
├── README.md
├── lecture/
│   ├── 1-reconciliation-fiber.md     ← How React decides what to update
│   ├── 2-hooks-deep-dive.md          ← Hook rules, closure traps, patterns
│   ├── 3-component-lifecycle.md      ← Mount/update/unmount in the hooks model
│   ├── 4-context-composition.md      ← Context, useReducer, composition patterns
│   ├── 5-refs-imperative.md          ← Refs, forwardRef, useImperativeHandle
│   └── 6-suspense-concurrent.md      ← Concurrent mode, Suspense, transitions
├── lab/
│   ├── custom-hooks-library/         ← Build 8 production-ready hooks
│   ├── compound-components/          ← Tabs, Accordion, Select with context
│   ├── render-props-hoc/             ← HOC and render prop patterns
│   └── suspense-data-fetching/       ← Suspense + React Query integration
├── homework/
│   ├── build-use-effect.md           ← Reimplement useEffect from scratch
│   ├── advanced-hooks.md             ← useSyncExternalStore, useTransition
│   └── react-internals-exploration.md ← Walk the Fiber tree
└── tests/
    ├── hooks.test.tsx
    ├── component-integration.test.tsx
    └── custom-renderer.test.tsx
```

## Schedule

| Days | Topic | Activity |
|------|-------|----------|
| 1–2  | Reconciliation & Fiber | Lecture 1 + DevTools profiling exercise |
| 3–4  | Hooks deep dive | Lecture 2 + start custom hooks lab |
| 5–6  | Component lifecycle | Lecture 3 + lifecycle diagrams |
| 7–8  | Context & composition | Lecture 4 + compound components lab |
| 9–10 | Refs & imperative | Lecture 5 + render-props/HOC lab |
| 11–12 | Suspense & concurrent | Lecture 6 + suspense lab |
| 13–17 | Homework + review | All three homework assignments |

## Setup

```bash
npm create vite@latest react-core-labs -- --template react-ts
cd react-core-labs
npm install
npm install -D @testing-library/react @testing-library/user-event \
               @testing-library/jest-dom vitest jsdom
```

## Assessment

- **Lab: Custom Hooks Library** — 25 pts
- **Lab: Compound Components** — 25 pts
- **Lab: Render Props / HOC** — 15 pts
- **Lab: Suspense Data Fetching** — 10 pts
- **Homework: Build useEffect** — 10 pts
- **Homework: Advanced Hooks** — 10 pts
- **Homework: React Internals** — 5 pts

**Total: 100 pts | Pass: 70+**
