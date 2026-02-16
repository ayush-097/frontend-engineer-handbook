/**
 * Intersection Observer — Lazy Image Loading + Infinite Scroll
 */

// ─── Lazy Image Loading ───────────────────────────────────────────────────────

class LazyImageLoader {
  #observer;
  #loadedCount = 0;

  constructor({ rootMargin = '200px', threshold = 0 } = {}) {
    this.#observer = new IntersectionObserver(this.#onIntersect.bind(this), {
      root: null, // viewport
      rootMargin, // Start loading 200px before visible
      threshold,
    });
  }

  /** Observe a single image (must have data-src attribute) */
  observe(img) {
    if (img.dataset.src) {
      this.#observer.observe(img);
    }
  }

  /** Observe all lazy images in a container */
  observeAll(root = document) {
    root.querySelectorAll('img[data-src]').forEach(img => this.observe(img));
  }

  #onIntersect(entries) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const img = entry.target;
      this.#loadImage(img);
      this.#observer.unobserve(img); // Stop watching after load
    });
  }

  #loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    img.classList.add('loading');

    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = src;
      if (srcset) img.srcset = srcset;
      img.removeAttribute('data-src');
      img.removeAttribute('data-srcset');
      img.classList.remove('loading');
      img.classList.add('loaded');
      this.#loadedCount++;
    };
    tempImg.onerror = () => {
      img.classList.remove('loading');
      img.classList.add('error');
    };
    tempImg.src = src;
  }

  get count() { return this.#loadedCount; }

  disconnect() { this.#observer.disconnect(); }
}

// ─── Infinite Scroll ──────────────────────────────────────────────────────────

class InfiniteScroll {
  #observer;
  #sentinel;
  #onLoadMore;
  #loading = false;
  #page = 1;

  constructor(container, onLoadMore, { rootMargin = '100px', threshold = 0 } = {}) {
    this.#onLoadMore = onLoadMore;

    // Create sentinel element at the bottom
    this.#sentinel = document.createElement('div');
    this.#sentinel.className = 'infinite-scroll-sentinel';
    this.#sentinel.style.height = '1px';
    container.appendChild(this.#sentinel);

    this.#observer = new IntersectionObserver(this.#onIntersect.bind(this), {
      rootMargin,
      threshold,
    });
    this.#observer.observe(this.#sentinel);
  }

  async #onIntersect([entry]) {
    if (!entry.isIntersecting || this.#loading) return;
    this.#loading = true;

    try {
      const hasMore = await this.#onLoadMore(this.#page++);
      if (!hasMore) this.disconnect(); // Stop when no more pages
    } finally {
      this.#loading = false;
    }
  }

  disconnect() {
    this.#observer.disconnect();
    this.#sentinel.remove();
  }
}

// ─── Scroll Animation ─────────────────────────────────────────────────────────

function animateOnScroll(selector, animationClass = 'animate-in', options = {}) {
  const { threshold = 0.15, rootMargin = '-50px', once = true } = options;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add(animationClass);
        if (once) observer.unobserve(entry.target);
      } else if (!once) {
        entry.target.classList.remove(animationClass);
      }
    });
  }, { threshold, rootMargin });

  document.querySelectorAll(selector).forEach(el => observer.observe(el));
  return observer;
}

export { LazyImageLoader, InfiniteScroll, animateOnScroll };
