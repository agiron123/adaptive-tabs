// src/setupTests.ts
import '@testing-library/jest-dom';

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe() {
    // Immediately call the callback with a mock entry
    // This simulates the ResizeObserver's behavior of firing initially
    this.callback([{ contentRect: { width: 0, height: 0, x: 0, y: 0, top: 0, right: 0, bottom: 0, left: 0 } } as ResizeObserverEntry], this);
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
}

window.ResizeObserver = MockResizeObserver;
