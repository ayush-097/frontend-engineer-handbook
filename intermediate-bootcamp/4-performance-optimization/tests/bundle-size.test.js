/**
 * Bundle size regression tests
 * Run after build to ensure bundles stay within budget
 */

const fs = require("fs");
const path = require("path");
const gzipSize = require("gzip-size");

// Budget in bytes (gzipped)
const BUDGETS = {
  mainBundle: 200 * 1024,      // 200kb
  vendorBundle: 150 * 1024,    // 150kb
  totalBundle: 500 * 1024,     // 500kb
  cssBundle: 50 * 1024,        // 50kb
};

describe("Bundle Size Budget", () => {
  let buildStats;

  beforeAll(() => {
    const statsPath = path.join(__dirname, "../dist/stats.json");
    
    if (!fs.existsSync(statsPath)) {
      throw new Error(
        "Build stats not found. Run 'npm run build' first."
      );
    }
    
    buildStats = JSON.parse(fs.readFileSync(statsPath, "utf8"));
  });

  it("main bundle is under budget", () => {
    const mainAsset = buildStats.assets.find(a =>
      a.name.startsWith("main") && a.name.endsWith(".js")
    );
    
    expect(mainAsset).toBeDefined();
    
    const filePath = path.join(__dirname, "../dist", mainAsset.name);
    const size = gzipSize.sync(fs.readFileSync(filePath));
    
    console.log(`Main bundle: ${(size / 1024).toFixed(2)}kb (gzipped)`);
    
    expect(size).toBeLessThan(BUDGETS.mainBundle);
  });

  it("vendor bundle is under budget", () => {
    const vendorAsset = buildStats.assets.find(a =>
      a.name.startsWith("vendor") && a.name.endsWith(".js")
    );
    
    if (!vendorAsset) {
      console.log("No vendor bundle found (might be merged with main)");
      return;
    }
    
    const filePath = path.join(__dirname, "../dist", vendorAsset.name);
    const size = gzipSize.sync(fs.readFileSync(filePath));
    
    console.log(`Vendor bundle: ${(size / 1024).toFixed(2)}kb (gzipped)`);
    
    expect(size).toBeLessThan(BUDGETS.vendorBundle);
  });

  it("total bundle is under budget", () => {
    let totalSize = 0;
    
    buildStats.assets
      .filter(a => a.name.endsWith(".js"))
      .forEach(asset => {
        const filePath = path.join(__dirname, "../dist", asset.name);
        const size = gzipSize.sync(fs.readFileSync(filePath));
        totalSize += size;
      });
    
    console.log(`Total JS: ${(totalSize / 1024).toFixed(2)}kb (gzipped)`);
    
    expect(totalSize).toBeLessThan(BUDGETS.totalBundle);
  });

  it("CSS bundle is under budget", () => {
    const cssAsset = buildStats.assets.find(a => a.name.endsWith(".css"));
    
    if (!cssAsset) {
      console.log("No CSS bundle found");
      return;
    }
    
    const filePath = path.join(__dirname, "../dist", cssAsset.name);
    const size = gzipSize.sync(fs.readFileSync(filePath));
    
    console.log(`CSS bundle: ${(size / 1024).toFixed(2)}kb (gzipped)`);
    
    expect(size).toBeLessThan(BUDGETS.cssBundle);
  });

  it("no duplicate dependencies", () => {
    // Check for common duplicates
    const modules = buildStats.modules || [];
    const moduleNames = modules.map(m => m.name);
    
    // Common libraries that shouldn't be duplicated
    const checkForDuplicates = [
      "react",
      "react-dom",
      "lodash",
      "moment",
      "date-fns",
    ];
    
    checkForDuplicates.forEach(libName => {
      const occurrences = moduleNames.filter(name =>
        name.includes(`node_modules/${libName}/`)
      );
      
      if (occurrences.length > 1) {
        console.warn(
          `Warning: ${libName} appears ${occurrences.length} times`
        );
      }
      
      // Allow up to 1 occurrence (some libs have peer deps)
      expect(occurrences.length).toBeLessThanOrEqual(1);
    });
  });

  it("chunks are properly split", () => {
    const chunks = buildStats.assets.filter(a =>
      a.name.includes("chunk") && a.name.endsWith(".js")
    );
    
    console.log(`Found ${chunks.length} chunks`);
    
    // Should have at least 3 route chunks
    expect(chunks.length).toBeGreaterThanOrEqual(3);
    
    // No single chunk should be huge
    chunks.forEach(chunk => {
      const filePath = path.join(__dirname, "../dist", chunk.name);
      const size = gzipSize.sync(fs.readFileSync(filePath));
      
      expect(size).toBeLessThan(100 * 1024); // 100kb max per chunk
    });
  });

  it("no large dependencies in main bundle", () => {
    // These should be in separate chunks or not included at all
    const bannedInMain = [
      "chart.js",
      "moment",
      "highlight.js",
      "pdf.js",
      "monaco-editor",
    ];
    
    const mainAsset = buildStats.assets.find(a =>
      a.name.startsWith("main") && a.name.endsWith(".js")
    );
    
    const mainModules = buildStats.modules
      .filter(m => m.chunks.includes(mainAsset.chunkNames[0]))
      .map(m => m.name);
    
    bannedInMain.forEach(lib => {
      const found = mainModules.some(name => name.includes(lib));
      
      if (found) {
        console.error(
          `${lib} found in main bundle! Should be code-split.`
        );
      }
      
      expect(found).toBe(false);
    });
  });
});

// Helper: Compare with previous build
describe("Bundle Size Regression", () => {
  it("bundle size hasn't increased significantly", () => {
    const previousStatsPath = path.join(
      __dirname,
      "../.bundle-cache/previous-stats.json"
    );
    
    if (!fs.existsSync(previousStatsPath)) {
      console.log("No previous stats to compare. Skipping regression test.");
      return;
    }
    
    const previousStats = JSON.parse(
      fs.readFileSync(previousStatsPath, "utf8")
    );
    const currentStats = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../dist/stats.json"), "utf8")
    );
    
    const previousTotal = previousStats.assets
      .filter(a => a.name.endsWith(".js"))
      .reduce((sum, a) => sum + a.size, 0);
    
    const currentTotal = currentStats.assets
      .filter(a => a.name.endsWith(".js"))
      .reduce((sum, a) => sum + a.size, 0);
    
    const increase = currentTotal - previousTotal;
    const percentIncrease = (increase / previousTotal) * 100;
    
    console.log(
      `Bundle size change: ${increase > 0 ? "+" : ""}${(
        increase / 1024
      ).toFixed(2)}kb (${percentIncrease.toFixed(1)}%)`
    );
    
    // Fail if bundle increased by more than 10%
    expect(percentIncrease).toBeLessThan(10);
  });
});
