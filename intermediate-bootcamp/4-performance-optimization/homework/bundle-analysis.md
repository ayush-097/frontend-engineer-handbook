# Homework: Bundle Analysis

Analyze your app's bundle and reduce size by 30%.

## Tasks

1. **Generate bundle report:**
   ```bash
   npm run build -- --analyze
   ```

2. **Identify largest dependencies:**
   - Which packages > 50kb?
   - Are they used? Where?

3. **Optimize:**
   - Replace heavy libs with lighter alternatives
   - Lazy load non-critical code
   - Tree shake properly (use `import { x } from "lib"` not `import * as`)

4. **Document:**
   Write `BUNDLE-REPORT.md` with:
   - Before/after bundle sizes
   - What you removed/replaced
   - What you lazy loaded
   - Percentage reduction

**Target:** 30% reduction  
**Time:** 2-3 hours  
**Grading:** 10 pts
