const progressBar = document.getElementById("progressBar");
const tocToggle = document.querySelector(".toc-toggle");
const tocPanel = document.querySelector(".toc-panel");
const tocLinks = [...document.querySelectorAll(".toc a[href^=\"#\"]")];
const chapters = [...document.querySelectorAll(".chapter")];
const scrollButtons = [...document.querySelectorAll("[data-scroll]")];

let chapterOffsets = [];

function cacheChapterOffsets() {
  const tocIds = new Set(tocLinks.map((link) => link.getAttribute("href").substring(1)));
  chapterOffsets = chapters
    .filter((chapter) => tocIds.has(chapter.id))
    .map((chapter) => ({
      id: chapter.id,
      offsetTop: chapter.offsetTop,
    }));
}

// Initial cache population
cacheChapterOffsets();

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${Math.min(progress, 100)}%`;
}

function updateActiveSection() {
  const offset = window.scrollY + window.innerHeight * 0.25;
  let activeId = chapterOffsets[0]?.id;

  for (const chapter of chapterOffsets) {
    if (chapter.offsetTop <= offset) {
      activeId = chapter.id;
    }
  }

  tocLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${activeId}`;
    link.classList.toggle("is-active", isActive);
  });
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

window.addEventListener("scroll", () => {
  updateProgress();
  updateActiveSection();
});

window.addEventListener("load", () => {
  cacheChapterOffsets();
  updateProgress();
  updateActiveSection();
  if (window.innerWidth <= 720 && tocPanel) {
    tocPanel.classList.remove("is-open");
  }
});

window.addEventListener("resize", () => {
  cacheChapterOffsets();
  updateActiveSection();
});

tocToggle?.addEventListener("click", handleTocToggle);

tocLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 720 && tocPanel?.classList.contains("is-open")) {
      tocPanel.classList.remove("is-open");
      tocToggle?.setAttribute("aria-expanded", "false");
    }
  });
});

scrollButtons.forEach((button) => {
  button.addEventListener("click", () => {
    scrollToTarget(button.getAttribute("data-scroll"));
  });
});

const suggestionForm = document.getElementById("suggestionForm");
const saveSuggestionButton = document.getElementById("saveSuggestion");
const copySuggestionButton = document.getElementById("copySuggestion");
const emailSuggestionButton = document.getElementById("emailSuggestion");
const formStatus = document.getElementById("formStatus");
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


if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleTocToggle,
    updateProgress,
    updateActiveSection,
    scrollToTarget,
    getSuggestionPayload,
    formatSuggestion,
    setFormStatus,
    saveSuggestionDraft,
    loadSuggestionDraft,
    copySuggestion,
    emailSuggestion
  };
}
