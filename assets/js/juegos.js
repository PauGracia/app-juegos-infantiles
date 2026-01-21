const settingsBtn = document.getElementById("settings-btn");
const settingsMenu = document.getElementById("settings-menu");

settingsBtn.addEventListener("click", () => {
  settingsMenu.style.display =
    settingsMenu.style.display === "block" ? "none" : "block";
});

document
  .getElementById("btn-settings-language")
  .addEventListener("click", () => {
    settingsMenu.style.display = "none";
    document.getElementById("modal-language").style.display = "flex";
  });

document
  .getElementById("btn-settings-objective")
  .addEventListener("click", () => {
    settingsMenu.style.display = "none";
    document.getElementById("modal-objective").style.display = "flex";
  });

function cerrarModalSettings() {
  document.querySelectorAll(".modal-settings").forEach((m) => {
    m.style.display = "none";
  });
}
