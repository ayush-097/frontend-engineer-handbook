# Web Vitals

## Core Web Vitals

### 1. LCP (Largest Contentful Paint)
**What:** Time until largest visible element renders  
**Target:** < 2.5s  
**Common culprits:**
- Large unoptimized images
- Slow server response
- Render-blocking JS/CSS

**Fix:**
- Optimize images (WebP, responsive)
- Preload critical resources
- Use CDN for static assets

### 2. FID (First Input Delay)
**What:** Time from user interaction to browser response  
**Target:** < 100ms  
**Common culprits:**
- Heavy JavaScript execution blocking main thread
- Long tasks (> 50ms)

**Fix:**
- Code split to reduce initial JS
- Defer non-critical JS
- Use web workers for heavy computation

### 3. CLS (Cumulative Layout Shift)
**What:** Visual stability (elements jumping around)  
**Target:** < 0.1  
**Common culprits:**
- Images without dimensions
- Ads/embeds injected dynamically
- Fonts causing text reflow

**Fix:**
- Set width/height on images
- Reserve space for dynamic content
- Use font-display: swap

## Measuring Web Vitals

```tsx
import { getCLS, getFID, getLCP } from "web-vitals";

getCLS(console.log);
getFID(console.log);
getLCP(console.log);
```
