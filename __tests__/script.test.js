const fs = require('fs');
const path = require('path');

describe('handleTocToggle', () => {
  let script;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <button class="toc-toggle" aria-expanded="false"></button>
      <div class="toc-panel"></div>
      <div id="progressBar"></div>
    `;

    // Reset modules to reload script.js and re-initialize global variables with the new DOM
    jest.resetModules();
    script = require('../script.js');
  });

  test('should toggle aria-expanded and is-open class from false to true', () => {
    const tocToggle = document.querySelector('.toc-toggle');
    const tocPanel = document.querySelector('.toc-panel');

    // Call handleTocToggle
    script.handleTocToggle();

    expect(tocToggle.getAttribute('aria-expanded')).toBe('true');
    expect(tocPanel.classList.contains('is-open')).toBe(true);
  });

  test('should toggle aria-expanded and is-open class from true to false', () => {
    const tocToggle = document.querySelector('.toc-toggle');
    const tocPanel = document.querySelector('.toc-panel');

    // Set to open state first
    tocToggle.setAttribute('aria-expanded', 'true');
    tocPanel.classList.add('is-open');

    // Call handleTocToggle
    script.handleTocToggle();

    expect(tocToggle.getAttribute('aria-expanded')).toBe('false');
    expect(tocPanel.classList.contains('is-open')).toBe(false);
  });

  test('should handle missing aria-expanded attribute (defaults to false)', () => {
    const tocToggle = document.querySelector('.toc-toggle');
    const tocPanel = document.querySelector('.toc-panel');
    tocToggle.removeAttribute('aria-expanded');

    script.handleTocToggle();

    expect(tocToggle.getAttribute('aria-expanded')).toBe('true');
    expect(tocPanel.classList.contains('is-open')).toBe(true);
  });

  test('should do nothing if elements are missing', () => {
    // Clear DOM and reload to ensure internal variables are null
    document.body.innerHTML = '';
    jest.resetModules();
    const scriptMissing = require('../script.js');

    expect(() => scriptMissing.handleTocToggle()).not.toThrow();
  });
});
