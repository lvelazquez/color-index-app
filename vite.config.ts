import { defineConfig } from 'vitest/config';

export default defineConfig({
    // Relative base so the build works on GitHub Pages project sites.
    base: './',
    test: { environment: 'jsdom' },
});
