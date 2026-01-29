// Detecta la ruta base desde el atributo del script
const i18nScript = document.currentScript;
const I18N_PATH = i18nScript.dataset.i18nPath || "./assets/i18n/";

function loadLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("uiLang", lang);
  document.documentElement.lang = lang;

  const script = document.createElement("script");
  script.src = `${I18N_PATH}${lang}.js`; // usa la ruta correcta según la página
  script.onload = () => {
    window.translations = window[`translations${lang.toUpperCase()}`] || {};
    applyTranslations();
    updateAllLanguageButtons(lang);

    const event = new CustomEvent("languageChanged", { detail: { lang } });
    document.dispatchEvent(event);
  };

  // Evitar cargar varias veces el mismo idioma
  const oldScript = document.querySelector(`script[src="${script.src}"]`);
  if (!oldScript) document.head.appendChild(script);
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
  const supported = ["es", "en", "ca", "fr", "pt", "it"];
  const lang = saved || (supported.includes(browserLang) ? browserLang : "es");
  loadLanguage(lang);
}

function updateAllLanguageButtons(lang) {
  document.querySelectorAll(".language-selector button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

// Inicializar idioma al cargar la página
document.addEventListener("DOMContentLoaded", initLanguage);
