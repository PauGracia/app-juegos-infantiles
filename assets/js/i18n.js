let translations = {};
let currentLang = "es";

async function loadLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("uiLang", lang);

  document.documentElement.lang = lang;

  const response = await fetch(`../../assets/i18n/${lang}.json`);
  translations = await response.json();
  window.translations = translations;

  applyTranslations();
  updateLanguageButtons(lang);
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    el.innerText = translations[key] || key;
  });
}

function initLanguage() {
  const saved = localStorage.getItem("uiLang");
  const browserLang = navigator.language.slice(0, 2);
  const supported = ["es", "en", "ca"];

  const lang = saved || (supported.includes(browserLang) ? browserLang : "es");

  loadLanguage(lang);
}

function updateLanguageButtons(lang) {
  document.querySelectorAll("#language-selector button").forEach((btn) => {
    btn.classList.toggle("active", btn.textContent.toLowerCase() === lang);
  });
}
