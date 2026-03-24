const { updateProgress, setProgressBar } = require('./script.js');

describe('updateProgress', () => {
  let mockProgressBar;

  beforeEach(() => {
    // Reset mocks and state before each test
    mockProgressBar = {
      style: {
        width: '0%'
      }
    };
    setProgressBar(mockProgressBar);

    // Mock window properties
    global.window = {
      innerHeight: 1000,
      scrollY: 0
    };

    // Mock document properties
    global.document = {
      documentElement: {
        scrollHeight: 2000
      }
    };
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  test('sets progress to 0% when at the top', () => {
    global.window.scrollY = 0;
    updateProgress();
    expect(mockProgressBar.style.width).toBe('0%');
  });

  test('sets progress to 50% when in the middle', () => {
    // scrollable = 2000 - 1000 = 1000
    // progress = (500 / 1000) * 100 = 50
    global.window.scrollY = 500;
    updateProgress();
    expect(mockProgressBar.style.width).toBe('50%');
  });

  test('sets progress to 100% when at the bottom', () => {
    global.window.scrollY = 1000;
    updateProgress();
    expect(mockProgressBar.style.width).toBe('100%');
  });

  test('sets progress to 100% when scrolled past the bottom (Math.min)', () => {
    global.window.scrollY = 1500;
    updateProgress();
    expect(mockProgressBar.style.width).toBe('100%');
  });

  test('sets progress to 0% when scrollable height is 0 (not scrollable)', () => {
    global.document.documentElement.scrollHeight = 1000; // innerHeight is also 1000
    updateProgress();
    expect(mockProgressBar.style.width).toBe('0%');
  });

  test('sets progress to 0% when scrollable height is negative', () => {
    global.document.documentElement.scrollHeight = 500; // less than innerHeight
    updateProgress();
    expect(mockProgressBar.style.width).toBe('0%');
  });

  test('handles missing documentElement gracefully', () => {
    global.document.documentElement = null;
    updateProgress();
    // scrollable = 0 - 1000 = -1000. progress = 0.
    expect(mockProgressBar.style.width).toBe('0%');
  });
});
