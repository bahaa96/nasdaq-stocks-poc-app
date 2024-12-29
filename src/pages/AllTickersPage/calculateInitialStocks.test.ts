import { calculateInitialStocks } from './calculateInitialStocks';

describe('calculateInitialStocks', () => {
  beforeEach(() => {
    // Mock window properties
    global.window = Object.create(window);
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 800 });
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
  });

  it('should return 24 for server-side rendering', () => {
    const originalWindow = global.window;
    global.window = undefined;
    expect(calculateInitialStocks(4)).toBe(24);
    global.window = originalWindow;
  });

  it('should calculate stocks correctly for large screens', () => {
    window.innerWidth = 1280;
    expect(calculateInitialStocks(4)).toBe(56); // 8 columns
  });

  it('should calculate stocks correctly for medium screens', () => {
    window.innerWidth = 1024;
    expect(calculateInitialStocks(4)).toBe(42); // 6 columns
  });

  it('should calculate stocks correctly for small screens', () => {
    window.innerWidth = 768;
    expect(calculateInitialStocks(4)).toBe(28); // 4 columns
  });

  it('should calculate stocks correctly for extra small screens', () => {
    window.innerWidth = 640;
    expect(calculateInitialStocks(4)).toBe(21); // 3 columns
  });
});
