let progressBar, tocToggle, tocPanel, tocLinks, chapters, scrollButtons;

if (typeof window !== 'undefined') {
  progressBar = document.getElementById("progressBar");
  tocToggle = document.querySelector(".toc-toggle");
  tocPanel = document.querySelector(".toc-panel");
  tocLinks = [...document.querySelectorAll(".toc a[href^=\"#\"]")];
  chapters = [...document.querySelectorAll(".chapter")];
  scrollButtons = [...document.querySelectorAll("[data-scroll]")];
}

function updateProgress() {
  const scrollable = (document.documentElement ? document.documentElement.scrollHeight : 0) - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progressBar) {
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  }
}

function updateActiveSection() {
  const offset = window.scrollY + window.innerHeight * 0.25;
  let activeId = chapters && chapters[0]?.id;

  if (chapters) {
    for (const chapter of chapters) {
      if (chapter.offsetTop <= offset) {
        activeId = chapter.id;
      }
    }
  }

  if (tocLinks) {
    tocLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("is-active", isActive);
    });
  }
}

function handleTocToggle() {
  if (!tocToggle || !tocPanel) return;
  const expanded = tocToggle.getAttribute("aria-expanded") === "true";
  tocToggle.setAttribute("aria-expanded", String(!expanded));
  tocPanel.classList.toggle("is-open", !expanded);
}

function scrollToTarget(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

if (typeof window !== 'undefined') {
  window.addEventListener("scroll", () => {
    updateProgress();
    updateActiveSection();
  });

  window.addEventListener("load", () => {
    updateProgress();
    updateActiveSection();
    if (window.innerWidth <= 720 && tocPanel) {
      tocPanel.classList.remove("is-open");
    }
  });

  tocToggle?.addEventListener("click", handleTocToggle);

  tocLinks?.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 720 && tocPanel?.classList.contains("is-open")) {
        tocPanel.classList.remove("is-open");
        tocToggle?.setAttribute("aria-expanded", "false");
      }
    });
  });

  scrollButtons?.forEach((button) => {
    button.addEventListener("click", () => {
      scrollToTarget(button.getAttribute("data-scroll"));
    });
  });
}

let suggestionForm, saveSuggestionButton, copySuggestionButton, emailSuggestionButton, formStatus;

if (typeof window !== 'undefined') {
  suggestionForm = document.getElementById("suggestionForm");
  saveSuggestionButton = document.getElementById("saveSuggestion");
  copySuggestionButton = document.getElementById("copySuggestion");
  emailSuggestionButton = document.getElementById("emailSuggestion");
  formStatus = document.getElementById("formStatus");
}

const RELIA_SUGGESTION_EMAIL = "inserir-email@relia.pt";
const SUGGESTION_STORAGE_KEY = "relia_manual_suggestion_draft";

function getSuggestionPayload() {
  if (!suggestionForm) return null;
  const data = new FormData(suggestionForm);
  return {
    name: (data.get("name") || "").toString().trim(),
    email: (data.get("email") || "").toString().trim(),
    chapter: (data.get("chapter") || "").toString().trim(),
    type: (data.get("type") || "").toString().trim(),
    message: (data.get("message") || "").toString().trim(),
  };
}

function formatSuggestion(payload) {
  return [
    "Contributo para o Manual Pedagogico RELIA",
    `Nome: ${payload.name || "Nao indicado"}`,
    `Email: ${payload.email || "Nao indicado"}`,
    `Capitulo: ${payload.chapter || "Nao indicado"}`,
    `Tipo: ${payload.type || "Nao indicado"}`,
    "",
    "Mensagem:",
    payload.message || "Sem mensagem.",
  ].join("\n");
}

function setFormStatus(message) {
  if (formStatus) {
    formStatus.textContent = message;
  }
}

function saveSuggestionDraft() {
  const payload = getSuggestionPayload();
  if (!payload) return;
  localStorage.setItem(SUGGESTION_STORAGE_KEY, JSON.stringify(payload));
  setFormStatus("Rascunho guardado localmente neste navegador.");
}

function loadSuggestionDraft() {
  if (!suggestionForm) return;
  const raw = localStorage.getItem(SUGGESTION_STORAGE_KEY);
  if (!raw) return;

  try {
    const payload = JSON.parse(raw);
    Object.entries(payload).forEach(([key, value]) => {
      const field = suggestionForm.elements.namedItem(key);
      if (field) {
        field.value = value;
      }
    });
  } catch {
    setFormStatus("Nao foi possivel carregar o rascunho guardado.");
  }
}

async function copySuggestion() {
  const payload = getSuggestionPayload();
  if (!payload) return;
  await navigator.clipboard.writeText(formatSuggestion(payload));
  setFormStatus("Contributo copiado para a area de transferencia.");
}

function emailSuggestion() {
  const payload = getSuggestionPayload();
  if (!payload) return;
  const subject = encodeURIComponent(`Contributo RELIA - ${payload.chapter || "Manual"}`);
  const body = encodeURIComponent(formatSuggestion(payload));
  window.location.href = `mailto:${RELIA_SUGGESTION_EMAIL}?subject=${subject}&body=${body}`;
  setFormStatus("Cliente de email preparado. Atualize o endereco oficial no script se necessario.");
}

if (typeof window !== 'undefined') {
  window.addEventListener("load", () => {
    loadSuggestionDraft();
  });

  saveSuggestionButton?.addEventListener("click", saveSuggestionDraft);
  copySuggestionButton?.addEventListener("click", () => {
    copySuggestion().catch(() => {
      setFormStatus("Nao foi possivel copiar automaticamente. Tente novamente.");
    });
  });
  emailSuggestionButton?.addEventListener("click", emailSuggestion);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateProgress,
    getSuggestionPayload,
    formatSuggestion,
    setFormStatus,
    saveSuggestionDraft,
    loadSuggestionDraft,
    copySuggestion,
    emailSuggestion,
    setProgressBar: (el) => { progressBar = el; },
    setChapters: (chs) => { chapters = chs; },
    setTocLinks: (links) => { tocLinks = links; }
  };
}
