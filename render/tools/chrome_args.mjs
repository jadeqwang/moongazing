// Chrome flags shared by everything that renders film frames (render.mjs, roto_test.mjs, order_check.mjs).
// --disable-accelerated-2d-canvas: every 2D canvas is rasterised on the CPU, always. Without it Chrome moves canvases
// between GPU and CPU mid-run, thin lines and type edges are redrawn differently, and a frame depends on what its page
// rendered before (tools/order_check.mjs tests this).
export const CHROME_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
  '--disable-gpu-sandbox', '--force-color-profile=srgb', '--disable-background-timer-throttling', '--disable-accelerated-2d-canvas'];
