# Module 3: Browser Basics

**Duration:** 1.5 weeks | **Level:** Beginner → Intermediate  
**Prerequisites:** HTML/CSS Fundamentals, JavaScript Fundamentals

## Overview

Understanding how browsers work is what separates frontend engineers who write working code from those who write *fast, reliable* code. This module goes deep into the browser's internals — the DOM, events, rendering pipeline, and Web APIs — giving you the mental models to debug hard problems and make performance decisions with confidence.

## Learning Objectives

By the end of this module you will be able to:

- **Traverse and manipulate** the DOM tree efficiently without causing layout thrash
- **Delegate events** to minimize listeners and handle dynamic content correctly
- **Explain** how browsers parse HTML, construct the render tree, and paint pixels
- **Use Web APIs** — Fetch, Storage, History, Observers — in real applications
- **Profile** a page with DevTools and identify performance bottlenecks
- **Build** a minimal virtual DOM implementation from scratch

## Module Structure

```
3-browser-basics/
├── README.md                              ← You are here
├── lecture/
│   ├── 1-dom-api.md                       ← DOM traversal, query, manipulation
│   ├── 2-events-delegation.md             ← Event model, bubbling, delegation
│   ├── 3-browser-rendering.md             ← Parsing, CSSOM, layout, paint
│   ├── 4-web-apis.md                      ← Fetch, Storage, History, Observers
│   └── 5-developer-tools.md               ← DevTools mastery, profiling
├── lab/
│   ├── virtual-dom-implementation/        ← Build React's core concept
│   ├── event-delegation-system/           ← jQuery-style event library
│   └── intersection-observer-lazy-load/   ← Lazy images + infinite scroll
├── homework/
│   ├── build-simple-framework.md          ← Mini UI framework from scratch
│   └── performance-audit.md              ← Real-site audit with action plan
└── tests/
    └── dom-manipulation.test.js           ← jsdom-based test suite
```

## Schedule

| Day | Topic | Activity |
|-----|-------|----------|
| 1–2 | DOM API | Lecture 1 + start Lab 1 |
| 3   | Events | Lecture 2 + Lab 2 |
| 4   | Rendering | Lecture 3 |
| 5   | Web APIs | Lecture 4 + Lab 3 |
| 6–7 | DevTools | Lecture 5 + Homework |

## Assessment

- **Lab 1 (Virtual DOM):** 30 pts — correctness of diffing algorithm
- **Lab 2 (Event Delegation):** 20 pts — API design + edge cases
- **Lab 3 (Lazy Load):** 20 pts — IntersectionObserver usage
- **Homework (Framework):** 30 pts — working counter + todo app

**Total: 100 pts | Pass: 70+**
