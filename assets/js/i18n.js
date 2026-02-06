// Detecta la ruta base desde el atributo del script
const i18nScript = document.currentScript;
const I18N_PATH = i18nScript.dataset.i18nPath || "./assets/i18n/";

function loadLanguage(lang, manual = false) {
  currentLang = lang;
  localStorage.setItem("uiLang", lang);
  document.documentElement.lang = lang;

  const script = document.createElement("script");
  script.src = `${I18N_PATH}${lang}.js`;

  script.onload = () => {
    window.translations = window[`translations${lang.toUpperCase()}`] || {};
    applyTranslations();
    updateAllLanguageButtons(lang);

    const event = new CustomEvent("languageChanged", {
      detail: { lang, manual },
    });
    document.dispatchEvent(event);
  };

  const oldScript = document.querySelector(`script[src="${script.src}"]`);
  if (!oldScript) document.head.appendChild(script);
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    el.innerHTML = translations[key] || key;
  });
}

function initLanguage() {
  const saved = localStorage.getItem("uiLang");
  const browserLang = navigator.language.slice(0, 2);
  const supported = ["es", "en", "ca", "fr", "pt", "it"];
  const lang = saved || (supported.includes(browserLang) ? browserLang : "es");
  loadLanguage(lang, false);
}

function updateAllLanguageButtons(lang) {
  document.querySelectorAll(".language-selector button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

// Inicializar idioma al cargar la página
document.addEventListener("DOMContentLoaded", initLanguage);
