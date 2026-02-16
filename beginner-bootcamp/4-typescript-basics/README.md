# Module 4: TypeScript Basics

**Duration:** 1.5 weeks | **Level:** Beginner → Intermediate  
**Prerequisites:** JavaScript Fundamentals (Modules 1–3)

## Overview

TypeScript is JavaScript with a type system bolted on top. It catches entire categories of bugs before your code ever runs, makes refactoring safe, and turns your editor into a documentation tool that understands your code. After this module you'll understand not just *how* to use TypeScript, but *why* its type system is designed the way it is.

## Learning Objectives

By the end of this module you will be able to:

- **Annotate** variables, function parameters, and return types accurately
- **Model** complex data shapes with interfaces, type aliases, and discriminated unions
- **Write** reusable generic functions and types that preserve type information
- **Apply** utility types (`Partial`, `Required`, `Pick`, `Omit`, `ReturnType`, etc.) to transform types
- **Configure** `tsconfig.json` for a real project with strict mode enabled
- **Migrate** an existing JavaScript codebase to TypeScript incrementally

## Module Structure

```
4-typescript-basics/
├── README.md
├── lecture/
│   ├── 1-type-system.md          ← Primitives, inference, narrowing, tsconfig
│   ├── 2-interfaces-types.md     ← Interfaces, type aliases, unions, intersections
│   ├── 3-generics.md             ← Generic functions, constraints, conditional types
│   └── 4-utility-types.md        ← Built-in utility types + building your own
├── lab/
│   ├── typed-fetch-wrapper/      ← Generic HTTP client with type safety
│   └── generic-components/       ← Reusable typed React components
├── homework/
│   └── convert-js-to-ts.md       ← Migrate a real JS codebase
└── tests/
    └── type-tests.ts             ← tsd / expect-type type-level tests
```

## Schedule

| Day | Topic | Activity |
|-----|-------|----------|
| 1–2 | Type System | Lecture 1 + setup tsconfig |
| 3–4 | Interfaces & Types | Lecture 2 + start Lab 1 |
| 5–6 | Generics | Lecture 3 + Lab 2 |
| 7–8 | Utility Types | Lecture 4 + finish labs |
| 9–10 | Migration | Homework |

## Setup

```bash
# Install TypeScript
npm install -D typescript @types/node

# Init config (use the project tsconfig below)
npx tsc --init

# Watch mode (compile on save)
npx tsc --watch

# Type-check without emitting
npx tsc --noEmit
```

## Assessment

- **Lab 1 (Fetch Wrapper):** 30 pts — type safety + generics
- **Lab 2 (Generic Components):** 30 pts — component APIs + constraints
- **Homework (Migration):** 40 pts — coverage + strict mode passing

**Total: 100 pts | Pass: 70+**
