function setupAutoAdvance(root, itemCount, setActive, intervalMs = 4800) {
  if (!root || itemCount < 2) {
    return;
  }

  let activeIndex = 0;
  let timerId;

  const start = () => {
    window.clearInterval(timerId);
    timerId = window.setInterval(() => {
      activeIndex = (activeIndex + 1) % itemCount;
      setActive(activeIndex);
    }, intervalMs);
  };

  const stop = () => {
    window.clearInterval(timerId);
  };

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", start);

  if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    start();
  }

  return (nextIndex) => {
    activeIndex = nextIndex;
    stop();
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      start();
    }
  };
}

function animateChipRow(viewport, track) {
  track.getAnimations().forEach((animation) => animation.cancel());
  track.style.transform = "translateX(0)";
  Array.from(track.querySelectorAll("[data-chip-clone='true']")).forEach((node) => {
    node.remove();
  });

  if (
    !viewport ||
    !track ||
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  requestAnimationFrame(() => {
    const overflow = track.scrollWidth - viewport.clientWidth;
    if (overflow <= 8) {
      return;
    }

    const originals = Array.from(track.children);
    originals.forEach((node) => {
      const clone = node.cloneNode(true);
      clone.setAttribute("data-chip-clone", "true");
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    const firstClone = track.querySelector("[data-chip-clone='true']");
    if (!firstClone) {
      return;
    }

    const distance = firstClone.offsetLeft - track.firstElementChild.offsetLeft;
    if (!distance) {
      return;
    }

    track.animate(
      [
        { transform: "translateX(0)" },
        { transform: `translateX(-${distance}px)` },
      ],
      {
        duration: Math.max(18000, distance * 35),
        iterations: Infinity,
        easing: "linear",
      }
    );
  });
}

function renderInteractiveTimeline(root, items) {
  root.replaceChildren();

  if (items.length === 0) {
    return;
  }

  const shell = document.createElement("div");
  shell.className = "timeline-shell";

  const nav = document.createElement("div");
  nav.className = "timeline-nav";
  nav.setAttribute("aria-label", "Awards timeline");

  const panel = document.createElement("article");
  panel.className = "timeline-panel";

  const panelYear = document.createElement("p");
  panelYear.className = "timeline-year";

  const panelHeading = document.createElement("h3");

  const panelCopy = document.createElement("p");

  panel.append(panelYear, panelHeading, panelCopy);

  const dotButtons = items.map((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "timeline-dot";
    button.setAttribute("aria-selected", "false");
    button.setAttribute("aria-controls", "timeline-panel");
    button.setAttribute("id", `timeline-dot-${index}`);

    const marker = document.createElement("span");
    marker.className = "timeline-dot-marker";
    marker.setAttribute("aria-hidden", "true");

    const year = document.createElement("span");
    year.className = "timeline-dot-year";
    year.textContent = item.year;

    button.append(marker, year);
    nav.appendChild(button);
    return button;
  });

  panel.id = "timeline-panel";
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("tabindex", "0");

  const setActive = (index) => {
    const item = items[index];
    panel.classList.remove("is-visible");

    dotButtons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === index;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    panel.setAttribute("aria-labelledby", `timeline-dot-${index}`);
    panelYear.textContent = item.year;
    panelHeading.textContent = item.title;
    panelCopy.textContent = item.description;

    requestAnimationFrame(() => {
      panel.classList.add("is-visible");
    });
  };

  const syncAutoAdvance = setupAutoAdvance(shell, items.length, setActive, 4200);

  dotButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      setActive(index);
      syncAutoAdvance?.(index);
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
        return;
      }

      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + direction + items.length) % items.length;
      dotButtons[nextIndex].focus();
      setActive(nextIndex);
      syncAutoAdvance?.(nextIndex);
    });
  });

  shell.append(nav, panel);
  root.appendChild(shell);
  setActive(0);
}

function renderPublicationCarousel(root, items) {
  root.replaceChildren();

  if (items.length === 0) {
    return;
  }

  const shell = document.createElement("div");
  shell.className = "publication-shell";

  const panel = document.createElement("article");
  panel.className = "publication-item publication-panel";

  const titleRow = document.createElement("div");
  titleRow.className = "publication-title-row";

  const heading = document.createElement("h3");
  const headingLink = document.createElement("a");
  headingLink.className = "publication-title-link";
  headingLink.target = "_blank";
  headingLink.rel = "noreferrer";
  heading.appendChild(headingLink);
  titleRow.append(heading);

  const tagsViewport = document.createElement("div");
  tagsViewport.className = "publication-tags-viewport";

  const tags = document.createElement("div");
  tags.className = "publication-tags";
  tagsViewport.appendChild(tags);

  const abstract = document.createElement("p");
  abstract.className = "publication-abstract";
  panel.append(titleRow, tagsViewport, abstract);

  const nav = document.createElement("div");
  nav.className = "publication-nav";

  const controls = items.map((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "publication-dot";
    button.setAttribute("aria-label", `Show paper ${index + 1}: ${item.title}`);
    nav.appendChild(button);
    return button;
  });

  const setActive = (index) => {
    const item = items[index];
    panel.classList.remove("is-visible");

    controls.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === index;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    headingLink.textContent = item.title;
    headingLink.href = item.links[0]?.href || "#";
    headingLink.style.pointerEvents = item.links[0]?.href ? "auto" : "none";
    headingLink.setAttribute("aria-disabled", item.links[0]?.href ? "false" : "true");
    tags.replaceChildren();

    const venueChip = document.createElement("span");
    venueChip.className = "publication-chip publication-chip-venue";
    venueChip.textContent = item.venue;
    tags.appendChild(venueChip);

    const yearChip = document.createElement("span");
    yearChip.className = "publication-chip publication-chip-year";
    yearChip.textContent = item.year;
    tags.appendChild(yearChip);

    const sourceChip = document.createElement("span");
    sourceChip.className = "publication-chip publication-chip-accent";
    sourceChip.textContent =
      item.links[0]?.label ||
      (item.venue.toLowerCase().includes("journal") ? "Journal" : "Conference");
    tags.appendChild(sourceChip);

    (item.tags || []).forEach((tag) => {
      const tagChip = document.createElement("span");
      tagChip.className = "publication-chip publication-chip-tag";
      tagChip.textContent = tag;
      tags.appendChild(tagChip);
    });

    item.authors.split(",").forEach((author) => {
      const authorChip = document.createElement("span");
      const authorName = author.trim();
      authorChip.className = authorName === "S. Chakrabarty"
        ? "publication-chip publication-chip-self"
        : "publication-chip publication-chip-author";
      authorChip.textContent = authorName;
      tags.appendChild(authorChip);
    });

    animateChipRow(tagsViewport, tags);

    abstract.textContent = item.abstract;

    requestAnimationFrame(() => {
      panel.classList.add("is-visible");
    });
  };

  const syncAutoAdvance = setupAutoAdvance(shell, items.length, setActive, 60000);

  controls.forEach((button, index) => {
    button.addEventListener("click", () => {
      setActive(index);
      syncAutoAdvance?.(index);
    });
  });

  shell.append(panel, nav);
  root.appendChild(shell);
  setActive(0);
}

function renderProjectCarousel(root, items) {
  root.replaceChildren();

  if (items.length === 0) {
    return;
  }

  const shell = document.createElement("div");
  shell.className = "project-shell";

  const panel = document.createElement("article");
  panel.className = "research-card project-panel";

  const heading = document.createElement("h3");
  const tagsViewport = document.createElement("div");
  tagsViewport.className = "project-tags-viewport";

  const tags = document.createElement("div");
  tags.className = "project-tags";
  tagsViewport.appendChild(tags);

  const copy = document.createElement("p");
  copy.className = "project-summary";

  const bullets = document.createElement("ul");
  bullets.className = "project-bullets";

  panel.append(heading, tagsViewport, copy, bullets);

  const nav = document.createElement("div");
  nav.className = "project-nav";

  const controls = items.map((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "project-dot";
    button.setAttribute("aria-label", `Show project ${index + 1}: ${item.title}`);
    nav.appendChild(button);
    return button;
  });

  const setActive = (index) => {
    const item = items[index];
    panel.classList.remove("is-visible");

    controls.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === index;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    heading.textContent = item.title;
    tags.replaceChildren();
    (item.tags || []).forEach((tag, tagIndex) => {
      const chip = document.createElement("span");
      const chipClass =
        tagIndex === 0
          ? "project-chip project-chip-date"
          : tagIndex === 3
            ? "project-chip project-chip-type"
            : "project-chip project-chip-affiliation";
      chip.className = chipClass;
      chip.textContent = tag;
      tags.appendChild(chip);
    });
    animateChipRow(tagsViewport, tags);
    copy.textContent = item.description;
    bullets.replaceChildren();
    (item.bullets || []).forEach((bullet) => {
      const li = document.createElement("li");
      li.textContent = bullet;
      bullets.appendChild(li);
    });

    requestAnimationFrame(() => {
      panel.classList.add("is-visible");
    });
  };

  const syncAutoAdvance = setupAutoAdvance(shell, items.length, setActive, 8000);

  controls.forEach((button, index) => {
    button.addEventListener("click", () => {
      setActive(index);
      syncAutoAdvance?.(index);
    });
  });

  shell.append(panel, nav);
  root.appendChild(shell);
  setActive(0);
}

export function renderSite(siteData) {
  const dataStatus = document.getElementById("data-status");
  dataStatus.hidden = true;
  dataStatus.textContent = "";

  document.title = `${siteData.name} | Academic Website`;
  document.getElementById("brand-name").textContent = siteData.name;
  document.getElementById("hero-role").textContent = siteData.role;
  document.getElementById("hero-name").textContent = siteData.name;
  document.getElementById("hero-summary").textContent = siteData.summary;
  document.getElementById("contact-note").textContent = siteData.contact.note;
  document.getElementById("hero-portrait").src = siteData.heroMedia.portrait.src;
  document.getElementById("hero-portrait").alt = siteData.heroMedia.portrait.alt;
  const headerLogo = document.getElementById("header-logo");
  const isDarkTheme = document.documentElement.dataset.theme === "dark";
  headerLogo.src = isDarkTheme
    ? siteData.heroMedia.logo.darkSrc
    : siteData.heroMedia.logo.lightSrc;
  headerLogo.alt = siteData.heroMedia.logo.alt;
  headerLogo.dataset.logoLight = siteData.heroMedia.logo.lightSrc;
  headerLogo.dataset.logoDark = siteData.heroMedia.logo.darkSrc;
  headerLogo.style.width = "83px";
  headerLogo.style.height = "auto";
  headerLogo.style.padding = isDarkTheme ? "12px" : "0";

  const aboutRoot = document.getElementById("about-content");
  aboutRoot.replaceChildren();
  siteData.about.forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    aboutRoot.appendChild(p);
  });

  const actionsRoot = document.getElementById("hero-actions");
  actionsRoot.replaceChildren();
  siteData.actions.forEach((action) => {
    const link = document.createElement("a");
    link.className = `button button-${action.kind}`;
    link.href = action.href;
    link.textContent = action.label;
    actionsRoot.appendChild(link);
  });

  const researchRoot = document.getElementById("research-grid");
  renderProjectCarousel(researchRoot, siteData.researchAreas);

  const publicationRoot = document.getElementById("publication-list");
  renderPublicationCarousel(publicationRoot, siteData.publications);

  const timelineRoot = document.getElementById("timeline");
  renderInteractiveTimeline(timelineRoot, siteData.timeline);

  const contactRoot = document.getElementById("contact-list");
  contactRoot.replaceChildren();
  siteData.contact.entries.forEach((entry) => {
    const dt = document.createElement("dt");
    dt.textContent = entry.label;

    const dd = document.createElement("dd");

    if (entry.href) {
      const link = document.createElement("a");
      link.href = entry.href;
      link.textContent = entry.value;
      dd.appendChild(link);
    } else {
      dd.textContent = entry.value;
    }

    contactRoot.append(dt, dd);
  });
}

export function showDataError(message) {
  const dataStatus = document.getElementById("data-status");
  dataStatus.hidden = false;
  dataStatus.textContent = message;
}
