const SITE_DATA_PATH = "../data/site-data.json";

export async function loadSiteData() {
  const response = await fetch(new URL(SITE_DATA_PATH, import.meta.url), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load site data: ${response.status}`);
  }

  return response.json();
}
