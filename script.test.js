/**
 * @jest-environment jsdom
 */

// We don't require at the top because it will fail due to missing DOM elements
// that are initialized at top level of script.js

describe('copySuggestion', () => {
  let mockClipboard;

  beforeEach(() => {
    // Setup DOM required for script.js top-level initialization
    document.body.innerHTML = `
      <div id="progressBar"></div>
      <button class="toc-toggle"></button>
      <div class="toc-panel"></div>
      <form id="suggestionForm">
        <input name="name" value="Test User">
        <input name="email" value="test@example.com">
        <input name="chapter" value="Chapter 1">
        <input name="type" value="Typo">
        <textarea name="message">Fixed a typo.</textarea>
      </form>
      <div id="formStatus"></div>
      <button id="saveSuggestion"></button>
      <button id="copySuggestion"></button>
      <button id="emailSuggestion"></button>
    `;

    // Mock navigator.clipboard
    mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      configurable: true,
    });

    // reset modules to ensure script.js runs again with the new DOM
    jest.resetModules();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should copy formatted suggestion to clipboard and update status', async () => {
    const { copySuggestion, formatSuggestion } = require('./script');

    await copySuggestion();

    const expectedText = formatSuggestion({
      name: "Test User",
      email: "test@example.com",
      chapter: "Chapter 1",
      type: "Typo",
      message: "Fixed a typo."
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedText);
    expect(document.getElementById('formStatus').textContent).toBe("Contributo copiado para a area de transferencia.");
  });

  test('should return early if no suggestion payload', async () => {
     // Re-setup DOM without the form
    document.body.innerHTML = `
      <div id="progressBar"></div>
      <button class="toc-toggle"></button>
      <div class="toc-panel"></div>
      <div id="formStatus"></div>
    `;

    const { copySuggestion } = require('./script');
    await copySuggestion();

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });
});

describe('formatSuggestion', () => {
  // We need the DOM elements even for these simple tests because they are at the top level
  beforeAll(() => {
      document.body.innerHTML = `
      <div id="progressBar"></div>
      <button class="toc-toggle"></button>
      <div class="toc-panel"></div>
      <form id="suggestionForm"></form>
      <div id="formStatus"></div>
    `;
  });

  test('should format suggestion correctly with all fields', () => {
    const { formatSuggestion } = require('./script');
    const payload = {
      name: "John Doe",
      email: "john@example.com",
      chapter: "Intro",
      type: "Suggestion",
      message: "Hello world"
    };
    const result = formatSuggestion(payload);
    expect(result).toContain("Nome: John Doe");
    expect(result).toContain("Email: john@example.com");
    expect(result).toContain("Capitulo: Intro");
    expect(result).toContain("Tipo: Suggestion");
    expect(result).toContain("Hello world");
  });

  test('should handle missing fields in payload', () => {
    const { formatSuggestion } = require('./script');
    const payload = {};
    const result = formatSuggestion(payload);
    expect(result).toContain("Nome: Nao indicado");
    expect(result).toContain("Mensagem:\nSem mensagem.");
  });
});
