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

describe('loadSuggestionDraft', () => {
  let script;
  const SUGGESTION_STORAGE_KEY = "relia_manual_suggestion_draft";

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <form id="suggestionForm">
        <input name="name" />
        <input name="email" />
        <select name="chapter">
          <option value="cap1">Capitulo 1</option>
          <option value="cap2">Capitulo 2</option>
        </select>
        <input name="type" />
        <textarea name="message"></textarea>
      </form>
      <div id="formStatus"></div>
      <div id="progressBar"></div>
    `;

    // Clear localStorage
    localStorage.clear();

    // Reset modules to reload script.js
    jest.resetModules();
    script = require('../script.js');
  });

  test('should populate form fields when valid JSON is in localStorage', () => {
    const payload = {
      name: 'John Doe',
      email: 'john@example.com',
      chapter: 'cap2',
      type: 'Sugestão',
      message: 'Hello world'
    };
    localStorage.setItem(SUGGESTION_STORAGE_KEY, JSON.stringify(payload));

    script.loadSuggestionDraft();

    const form = document.getElementById('suggestionForm');
    expect(form.elements.namedItem('name').value).toBe('John Doe');
    expect(form.elements.namedItem('email').value).toBe('john@example.com');
    expect(form.elements.namedItem('chapter').value).toBe('cap2');
    expect(form.elements.namedItem('type').value).toBe('Sugestão');
    expect(form.elements.namedItem('message').value).toBe('Hello world');
  });

  test('should set error status when invalid JSON is in localStorage', () => {
    localStorage.setItem(SUGGESTION_STORAGE_KEY, 'invalid-json{');

    script.loadSuggestionDraft();

    const formStatus = document.getElementById('formStatus');
    expect(formStatus.textContent).toBe('Nao foi possivel carregar o rascunho guardado.');
  });

  test('should do nothing when localStorage is empty', () => {
    script.loadSuggestionDraft();

    const form = document.getElementById('suggestionForm');
    expect(form.elements.namedItem('name').value).toBe('');
    expect(document.getElementById('formStatus').textContent).toBe('');
  });

  test('should do nothing if suggestionForm is missing', () => {
    document.body.innerHTML = '<div id="formStatus"></div><div id="progressBar"></div>';
    jest.resetModules();
    const scriptMissing = require('../script.js');

    expect(() => scriptMissing.loadSuggestionDraft()).not.toThrow();
  });
});
