import { renderSite, showDataError } from "./render-site.js?v=13";
import { loadSiteData } from "./site-data.js?v=13";

async function initializeSite() {
  try {
    const siteData = await loadSiteData();
    renderSite(siteData);
  } catch (error) {
    console.error(error);
    const fileProtocolMessage =
      window.location.protocol === "file:"
        ? "data/site-data.json cannot be loaded from a file:// page in many browsers. Open the site through http://localhost:8000 or GitHub Pages instead."
        : "data/site-data.json could not be loaded. Check that the file exists and reload the page.";
    showDataError(fileProtocolMessage);
  }
}

initializeSite();
