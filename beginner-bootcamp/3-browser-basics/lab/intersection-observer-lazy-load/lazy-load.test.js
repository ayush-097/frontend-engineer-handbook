/**
 * Intersection Observer — Lazy Load Test Suite
 *
 * NOTE: jsdom does not implement IntersectionObserver, so we mock it
 * and test the logic separately from the browser API.
 *
 * Run: npm test lazy-load.test.js
 */

const { LazyImageLoader, InfiniteScroll, animateOnScroll } = require('./lazy-load.js');

// ─── Mock IntersectionObserver ────────────────────────────────────────────────

let observerCallback = null;
const observedElements = new Set();
const mockObserver = {
  observe: jest.fn((el) => observedElements.add(el)),
  unobserve: jest.fn((el) => observedElements.delete(el)),
  disconnect: jest.fn(() => observedElements.clear()),
};

global.IntersectionObserver = jest.fn((callback, options) => {
  observerCallback = callback;
  return mockObserver;
});

// Helper to simulate an element entering the viewport
function triggerIntersect(elements, isIntersecting = true) {
  if (!Array.isArray(elements)) elements = [elements];
  const entries = elements.map(target => ({
    isIntersecting,
    intersectionRatio: isIntersecting ? 0.5 : 0,
    target,
    boundingClientRect: {},
    intersectionRect: {},
    rootBounds: {},
    time: Date.now(),
  }));
  observerCallback(entries, mockObserver);
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  observedElements.clear();
  jest.clearAllMocks();
  observerCallback = null;

  document.body.innerHTML = `
    <div id="container">
      <img id="img1" data-src="image1.jpg" src="placeholder.svg" alt="Image 1">
      <img id="img2" data-src="image2.jpg" src="placeholder.svg" alt="Image 2">
      <img id="img3" data-src="image3.jpg"
           data-srcset="image3@2x.jpg 2x"
           src="placeholder.svg" alt="Image 3">
      <img id="img4" src="already-loaded.jpg" alt="Already loaded">
    </div>
    <div id="feed"></div>
  `;
});

// ─── LazyImageLoader ──────────────────────────────────────────────────────────

describe('LazyImageLoader', () => {
  describe('constructor', () => {
    test('creates an IntersectionObserver with given options', () => {
      new LazyImageLoader({ rootMargin: '100px', threshold: 0.1 });
      expect(IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ rootMargin: '100px', threshold: 0.1 })
      );
    });

    test('uses default options when none provided', () => {
      new LazyImageLoader();
      expect(IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ rootMargin: expect.any(String) })
      );
    });
  });

  describe('observe()', () => {
    test('observes an img with data-src', () => {
      const loader = new LazyImageLoader();
      const img = document.getElementById('img1');
      loader.observe(img);
      expect(mockObserver.observe).toHaveBeenCalledWith(img);
    });

    test('does NOT observe img without data-src', () => {
      const loader = new LazyImageLoader();
      const img = document.getElementById('img4'); // No data-src
      loader.observe(img);
      expect(mockObserver.observe).not.toHaveBeenCalled();
    });
  });

  describe('observeAll()', () => {
    test('observes all [data-src] images in document', () => {
      const loader = new LazyImageLoader();
      loader.observeAll();
      // img1, img2, img3 have data-src; img4 does not
      expect(mockObserver.observe).toHaveBeenCalledTimes(3);
    });

    test('observes only images inside given root', () => {
      const loader = new LazyImageLoader();
      const container = document.getElementById('container');
      loader.observeAll(container);
      expect(mockObserver.observe).toHaveBeenCalledTimes(3);
    });
  });

  describe('image loading on intersection', () => {
    test('sets img.src from data-src when intersecting', () => {
      const loader = new LazyImageLoader();
      const img = document.getElementById('img1');
      loader.observe(img);
      triggerIntersect(img, true);
      expect(img.src).toContain('image1.jpg');
    });

    test('also sets srcset from data-srcset when present', () => {
      const loader = new LazyImageLoader();
      const img = document.getElementById('img3');
      loader.observe(img);
      triggerIntersect(img, true);
      expect(img.src).toContain('image3.jpg');
      expect(img.srcset).toContain('image3@2x.jpg');
    });

    test('removes data-src attribute after loading', () => {
      const loader = new LazyImageLoader();
      const img = document.getElementById('img1');
      loader.observe(img);
      triggerIntersect(img, true);
      expect(img.hasAttribute('data-src')).toBe(false);
    });

    test('removes data-srcset attribute after loading', () => {
      const loader = new LazyImageLoader();
      const img = document.getElementById('img3');
      loader.observe(img);
      triggerIntersect(img, true);
      expect(img.hasAttribute('data-srcset')).toBe(false);
    });

    test('unobserves image after loading', () => {
      const loader = new LazyImageLoader();
      const img = document.getElementById('img1');
      loader.observe(img);
      triggerIntersect(img, true);
      expect(mockObserver.unobserve).toHaveBeenCalledWith(img);
    });

    test('does NOT load image when not intersecting', () => {
      const loader = new LazyImageLoader();
      const img = document.getElementById('img1');
      loader.observe(img);
      triggerIntersect(img, false);
      expect(img.src).not.toContain('image1.jpg');
      expect(img.src).toContain('placeholder.svg');
    });

    test('does NOT unobserve image when not intersecting', () => {
      const loader = new LazyImageLoader();
      const img = document.getElementById('img1');
      loader.observe(img);
      triggerIntersect(img, false);
      expect(mockObserver.unobserve).not.toHaveBeenCalled();
    });
  });

  describe('CSS classes', () => {
    test('adds "loading" class when intersection fires', () => {
      const loader = new LazyImageLoader();
      const img = document.getElementById('img1');
      loader.observe(img);
      triggerIntersect(img, true);
      // loading class added synchronously
      expect(img.classList.contains('loading')).toBe(true);
    });
  });

  describe('count', () => {
    test('starts at 0', () => {
      const loader = new LazyImageLoader();
      expect(loader.count).toBe(0);
    });
  });

  describe('disconnect()', () => {
    test('disconnects the observer', () => {
      const loader = new LazyImageLoader();
      loader.disconnect();
      expect(mockObserver.disconnect).toHaveBeenCalled();
    });
  });
});

// ─── InfiniteScroll ───────────────────────────────────────────────────────────

describe('InfiniteScroll', () => {
  test('creates an IntersectionObserver', () => {
    new InfiniteScroll(document.getElementById('feed'), async () => false);
    expect(IntersectionObserver).toHaveBeenCalled();
  });

  test('appends a sentinel element to container', () => {
    const feed = document.getElementById('feed');
    new InfiniteScroll(feed, async () => false);
    expect(feed.querySelector('.infinite-scroll-sentinel')).not.toBeNull();
  });

  test('observes the sentinel element', () => {
    const feed = document.getElementById('feed');
    new InfiniteScroll(feed, async () => false);
    const sentinel = feed.querySelector('.infinite-scroll-sentinel');
    expect(mockObserver.observe).toHaveBeenCalledWith(sentinel);
  });

  test('calls onLoadMore when sentinel intersects', async () => {
    const onLoadMore = jest.fn().mockResolvedValue(false);
    const feed = document.getElementById('feed');
    new InfiniteScroll(feed, onLoadMore);

    const sentinel = feed.querySelector('.infinite-scroll-sentinel');
    triggerIntersect(sentinel, true);

    // Wait for async onLoadMore to complete
    await Promise.resolve();
    await Promise.resolve();

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  test('calls onLoadMore with correct page number', async () => {
    const pages = [];
    const onLoadMore = jest.fn(async (page) => {
      pages.push(page);
      return pages.length < 3;
    });

    const feed = document.getElementById('feed');
    new InfiniteScroll(feed, onLoadMore);
    const sentinel = feed.querySelector('.infinite-scroll-sentinel');

    triggerIntersect(sentinel, true);
    await Promise.resolve(); await Promise.resolve();

    triggerIntersect(sentinel, true);
    await Promise.resolve(); await Promise.resolve();

    expect(pages).toEqual([1, 2]);
  });

  test('does not call onLoadMore when not intersecting', async () => {
    const onLoadMore = jest.fn().mockResolvedValue(true);
    const feed = document.getElementById('feed');
    new InfiniteScroll(feed, onLoadMore);
    const sentinel = feed.querySelector('.infinite-scroll-sentinel');

    triggerIntersect(sentinel, false);
    await Promise.resolve();

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  test('calls disconnect() when onLoadMore returns false', async () => {
    const onLoadMore = jest.fn().mockResolvedValue(false);
    const feed = document.getElementById('feed');
    const scroll = new InfiniteScroll(feed, onLoadMore);
    const sentinel = feed.querySelector('.infinite-scroll-sentinel');

    triggerIntersect(sentinel, true);
    await Promise.resolve(); await Promise.resolve();

    expect(mockObserver.disconnect).toHaveBeenCalled();
  });

  describe('disconnect()', () => {
    test('removes sentinel from DOM', () => {
      const feed = document.getElementById('feed');
      const scroll = new InfiniteScroll(feed, async () => false);
      scroll.disconnect();
      expect(feed.querySelector('.infinite-scroll-sentinel')).toBeNull();
    });

    test('disconnects the observer', () => {
      const feed = document.getElementById('feed');
      const scroll = new InfiniteScroll(feed, async () => false);
      scroll.disconnect();
      expect(mockObserver.disconnect).toHaveBeenCalled();
    });
  });
});

// ─── animateOnScroll ──────────────────────────────────────────────────────────

describe('animateOnScroll', () => {
  beforeEach(() => {
    document.body.innerHTML += `
      <div class="card">Card 1</div>
      <div class="card">Card 2</div>
      <div class="card">Card 3</div>
    `;
  });

  test('creates an IntersectionObserver', () => {
    animateOnScroll('.card', 'visible');
    expect(IntersectionObserver).toHaveBeenCalled();
  });

  test('observes all matching elements', () => {
    animateOnScroll('.card', 'visible');
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      expect(mockObserver.observe).toHaveBeenCalledWith(card);
    });
  });

  test('adds animation class when element intersects', () => {
    animateOnScroll('.card', 'slide-in');
    const card = document.querySelector('.card');
    triggerIntersect(card, true);
    expect(card.classList.contains('slide-in')).toBe(true);
  });

  test('does NOT add class when not intersecting', () => {
    animateOnScroll('.card', 'slide-in');
    const card = document.querySelector('.card');
    triggerIntersect(card, false);
    expect(card.classList.contains('slide-in')).toBe(false);
  });

  test('with once:true, unobserves after adding class', () => {
    animateOnScroll('.card', 'slide-in', { once: true });
    const card = document.querySelector('.card');
    triggerIntersect(card, true);
    expect(mockObserver.unobserve).toHaveBeenCalledWith(card);
  });

  test('with once:false, does NOT unobserve after adding class', () => {
    animateOnScroll('.card', 'slide-in', { once: false });
    const card = document.querySelector('.card');
    triggerIntersect(card, true);
    expect(mockObserver.unobserve).not.toHaveBeenCalled();
  });

  test('with once:false, removes class when not intersecting', () => {
    animateOnScroll('.card', 'slide-in', { once: false });
    const card = document.querySelector('.card');

    triggerIntersect(card, true);
    expect(card.classList.contains('slide-in')).toBe(true);

    triggerIntersect(card, false);
    expect(card.classList.contains('slide-in')).toBe(false);
  });

  test('returns the observer', () => {
    const obs = animateOnScroll('.card', 'visible');
    expect(obs).toBeDefined();
    expect(typeof obs.disconnect).toBe('function');
  });

  test('passes options to IntersectionObserver', () => {
    animateOnScroll('.card', 'visible', { threshold: 0.3, rootMargin: '-20px' });
    expect(IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ threshold: 0.3, rootMargin: '-20px' })
    );
  });
});
