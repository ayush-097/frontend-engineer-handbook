# Homework: Optimize Slow App

Fix 10 performance issues in a deliberately slow React app.

## The App
A todo list app with intentional performance problems:
1. No memoization (re-renders everything on every keystroke)
2. Large list without virtualization (1000 items)
3. Inline object/function creation in render
4. Heavy computation in render
5. Unoptimized images
6. No code splitting
7. Large bundle (includes entire lodash)
8. Layout shifts (no image dimensions)
9. Render-blocking resources
10. No lazy loading

## Your Task
Fix all 10 issues. Document each fix in `FIXES.md`.

## Acceptance Criteria
- Lighthouse Performance score > 90
- No unnecessary re-renders (check with Profiler)
- List scrolls at 60fps
- Bundle size < 200kb gzipped
- CLS < 0.1

**Time:** 4-5 hours  
**Grading:** 15 pts (1.5 per fix)
