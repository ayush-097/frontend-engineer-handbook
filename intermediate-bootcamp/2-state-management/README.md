# Module 2: State Management

**Duration:** 3 weeks | **Level:** Intermediate  
**Prerequisites:** React Core (Module 5)

## Overview

State is the hardest problem in frontend development. This module teaches you to recognize different *kinds* of state (UI, server cache, URL, form), choose the right tool for each, design state shapes that scale, implement optimistic updates that handle failures gracefully, and use state machines to eliminate impossible states entirely.

## Learning Objectives

By the end of this module you will be able to:

- **Classify** state into UI, server, URL, and form categories and choose appropriate tools
- **Design** normalized state shapes that avoid duplication and stale data
- **Implement** Flux architecture patterns (unidirectional data flow, actions, reducers)
- **Build** global stores with Zustand using selectors, middleware, and devtools
- **Manage** server state with React Query (caching, refetching, optimistic updates)
- **Model** complex flows with state machines using XState
- **Implement** cache invalidation strategies that keep UI consistent
- **Debug** state issues using Redux DevTools, React Query DevTools

## Module Structure

```
2-state-management/
├── README.md
├── lecture/
│   ├── 1-state-architecture.md      ← Classifying state, colocation
│   ├── 2-context-vs-redux.md        ← When to use each, Flux pattern
│   ├── 3-zustand-patterns.md        ← Slices, middleware, selectors
│   ├── 4-server-state.md            ← React Query, cache strategies
│   ├── 5-optimistic-updates.md      ← Optimistic UI, rollback, mutations
│   └── 6-state-machines.md          ← XState, modeling impossible states
├── lab/
│   ├── shopping-cart-zustand/       ← E-commerce cart with persistence
│   ├── react-query-patterns/        ← Infinite scroll, mutations, refetch
│   ├── xstate-form-wizard/          ← Multi-step form with validation
│   └── flux-implementation/         ← Build Redux from scratch
├── homework/
│   ├── build-mini-redux.md          ← Implement createStore + middleware
│   ├── complex-state-machine.md     ← Model a game with XState
│   └── cache-invalidation-strategy.md ← Design cache update strategies
└── tests/
    ├── store.test.ts                 ← Zustand store tests
    ├── optimistic-ui.test.tsx        ← Optimistic update tests
    └── state-machine.test.ts         ← XState machine tests
```

## Schedule

| Days | Topic | Activity |
|------|-------|----------|
| 1–2  | State architecture | Lecture 1 + classify state exercise |
| 3–5  | Context vs Redux | Lecture 2 + Flux lab |
| 6–8  | Zustand patterns | Lecture 3 + shopping cart lab |
| 9–11 | Server state | Lecture 4 + React Query lab |
| 12–14| Optimistic updates | Lecture 5 + mutation patterns |
| 15–17| State machines | Lecture 6 + XState wizard lab |
| 18–21| Homework + review | All three assignments |

## Setup

```bash
npm create vite@latest state-mgmt-labs -- --template react-ts
cd state-mgmt-labs
npm install

# State management libraries
npm install zustand immer
npm install @tanstack/react-query
npm install xstate @xstate/react

# Dev tools
npm install -D @redux-devtools/extension
npm install -D @tanstack/react-query-devtools
```

## Assessment

- **Lab: Shopping Cart (Zustand)** — 25 pts
- **Lab: React Query Patterns** — 25 pts
- **Lab: XState Form Wizard** — 20 pts
- **Lab: Flux Implementation** — 10 pts
- **Homework: Build Mini Redux** — 10 pts
- **Homework: Complex State Machine** — 5 pts
- **Homework: Cache Invalidation** — 5 pts

**Total: 100 pts | Pass: 70+**
