const themeStorageKey = "preferred-theme";

export function initializeThemeToggle() {
  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const headerLogo = document.getElementById("header-logo");

  function applyToggleChrome(theme) {
    themeToggle.style.display = "grid";
    themeToggle.style.placeItems = "center";
    themeToggle.style.width = "46px";
    themeToggle.style.height = "46px";
    themeToggle.style.minWidth = "46px";
    themeToggle.style.minHeight = "46px";
    themeToggle.style.maxWidth = "46px";
    themeToggle.style.maxHeight = "46px";
    themeToggle.style.padding = "0";
    themeToggle.style.borderRadius = "999px";
    themeToggle.style.lineHeight = "1";
    themeToggle.style.flex = "0 0 46px";
  }

  function applyTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    root.dataset.theme = nextTheme;
    applyToggleChrome(nextTheme);
    themeToggle.setAttribute("aria-pressed", String(nextTheme === "dark"));
    themeToggle.setAttribute(
      "aria-label",
      nextTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
    if (headerLogo?.dataset.logoLight && headerLogo.dataset.logoDark) {
      headerLogo.src =
        nextTheme === "dark" ? headerLogo.dataset.logoDark : headerLogo.dataset.logoLight;
      headerLogo.style.width = "83px";
      headerLogo.style.height = "auto";
      headerLogo.style.padding = nextTheme === "dark" ? "12px" : "0";
    }
  }

  const savedTheme = window.localStorage.getItem(themeStorageKey);
  const systemPrefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  applyTheme(savedTheme || (systemPrefersDark ? "dark" : "light"));

  themeToggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    window.localStorage.setItem(themeStorageKey, nextTheme);
  });
}
