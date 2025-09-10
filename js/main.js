import "/css/style.css";

/* ───────────────────────────────────────────
   NAV: mobile toggle + desktop scroll styles
   ─────────────────────────────────────────── */
const nav    = document.getElementById("mainNavbar");
const toggle = document.getElementById("navToggle");
const links  = document.getElementById("navLinks");

function isDesktop() {
  return window.innerWidth >= 768; // Tailwind md
}

function lockBodyScroll(lock) {
  document.documentElement.style.overflow = lock ? "hidden" : "";
  document.body.style.overflow = lock ? "hidden" : "";
}

function openMobileMenu() {
  if (!links) return;
  links.classList.remove("hidden");
  links.classList.add("flex");

  // Overlay panel directly under h-20 (5rem) navbar
  links.classList.add(
    "fixed", "top-20", "left-0", "right-0", "z-[60]",
    "flex-col", "bg-black/95", "p-4", "space-y-4",
    "max-h-[calc(100vh-5rem)]", "overflow-y-auto"
  );

  lockBodyScroll(true);
  // Re-position dropdown for mobile overlay
  placeDownloadsMenu();
}

function closeMobileMenu() {
  if (!links) return;
  links.classList.add("hidden");
  links.classList.remove("flex");

  // Strip overlay-specific utilities so desktop layout isn’t affected
  links.classList.remove(
    "fixed","top-20","left-0","right-0","z-[60]",
    "flex-col","bg-black/95","p-4","space-y-4",
    "max-h-[calc(100vh-5rem)]","overflow-y-auto"
  );

  lockBodyScroll(false);
  placeDownloadsMenu(); // reset dropdown positioning
}

toggle?.addEventListener("click", () => {
  if (!links) return;
  const opening = links.classList.contains("hidden");
  opening ? openMobileMenu() : closeMobileMenu();
});

function setNavBg() {
  if (!nav) return;

  if (isDesktop()) {
    // Desktop: transparent at top, dark on scroll
    if (window.scrollY > 50) {
      nav.classList.add("md:bg-black/80","md:shadow-sm","md:backdrop-blur-sm");
      nav.classList.remove("md:bg-transparent");
    } else {
      nav.classList.remove("md:bg-black/80","md:shadow-sm","md:backdrop-blur-sm");
      nav.classList.add("md:bg-transparent");
    }
  } else {
    // Mobile: always solid dark
    nav.classList.remove("md:bg-black/80","md:shadow-sm","md:backdrop-blur-sm","md:bg-transparent");
    nav.classList.add("bg-black/80");
  }
}
setNavBg();
window.addEventListener("scroll", setNavBg, { passive: true });
window.addEventListener("resize", () => { setNavBg(); placeDownloadsMenu(); });

/* Close mobile overlay when clicking an in-page link */
document.querySelectorAll('#navLinks a[href^="#"]').forEach(a => {
  a.addEventListener("click", () => {
    if (!links) return;
    if (links.classList.contains("fixed")) closeMobileMenu();
  });
});

/* ───────────────────────────────────────────
   COUNTERS (learnMore)
   ─────────────────────────────────────────── */
function animateCounter(el) {
  const target   = parseFloat(el.dataset.target);
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const duration = parseInt(el.dataset.duration || "1000", 10);
  const start    = performance.now();

  function tick(now) {
    const p   = Math.min(1, (now - start) / duration);
    const val = target * p;
    el.textContent = val.toFixed(decimals).replace(/\.0+$/, "");
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const learnMore = document.getElementById("learnMore");
if (learnMore) {
  const counters = learnMore.querySelectorAll(".counter");
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        counters.forEach(animateCounter);
        obs.disconnect();
      }
    });
  }, { threshold: 0.25 });
  io.observe(learnMore);
}

/* ───────────────────────────────────────────
   REVEAL-ON-SCROLL (respects reduced motion)
   ─────────────────────────────────────────── */
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function revealOnScroll() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  if (prefersReduced) {
    els.forEach(el => el.classList.remove("opacity-0","translate-y-6"));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const idx = Array.from(el.parentElement.children).indexOf(el);
      el.style.transitionDelay = `${Math.min(idx * 80, 400)}ms`;
      el.classList.add("opacity-100","translate-y-0","duration-700","ease-out","will-change-transform","will-change-opacity");
      el.classList.remove("opacity-0","translate-y-6");
      obs.unobserve(el);
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
}
revealOnScroll();

/* ───────────────────────────────────────────
   DOWNLOADS DROPDOWN (desktop + mobile overlay)
   ─────────────────────────────────────────── */
const downloadsBtn  = document.getElementById("downloadsBtn");
const downloadsMenu = document.getElementById("downloadsMenu");
const pdfMenuList   = document.getElementById("pdfMenuList");

function placeDownloadsMenu() {
  if (!downloadsMenu) return;

  // Reset to desktop defaults first
  downloadsMenu.classList.remove(
    "fixed","top-[calc(5rem+2.5rem)]","left-4","right-4","mt-0"
  );
  downloadsMenu.classList.add("absolute","top-full","left-0","mt-1");

  // If mobile overlay is open, pin the dropdown as a fixed panel below the bar
  if (!isDesktop() && links?.classList.contains("fixed")) {
    downloadsMenu.classList.remove("absolute","top-full","left-0","mt-1");
    downloadsMenu.classList.add(
      "fixed",
      "top-[calc(5rem+2.5rem)]", // navbar 5rem + ~button height
      "left-4","right-4","mt-0",
      "z-[70]" // above the overlay list items
    );
  }
}

async function setupDownloadsMenu() {
  if (!downloadsBtn || !downloadsMenu || !pdfMenuList) return;

  // Load manifest
  try {
    const res = await fetch("/pdfs.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = await res.json();

    pdfMenuList.innerHTML = Array.isArray(items) && items.length
      ? items.map(({ name, url }) =>
          `<a href="${url}" class="block px-4 py-2.5 text-sm hover:bg-white/10">${escapeHtml(name)}</a>`
        ).join("")
      : `<div class="px-4 py-3 text-sm opacity-70">No downloads available.</div>`;
  } catch (e) {
    console.error("Failed to load /pdfs.json", e);
    pdfMenuList.innerHTML = `<div class="px-4 py-3 text-sm text-red-300">Failed to load downloads.</div>`;
  }

  // Toggle
  const toggleOpen = open => {
    downloadsMenu.classList.toggle("open", open);
    downloadsBtn.setAttribute("aria-expanded", open ? "true" : "false");
    placeDownloadsMenu();
  };

  downloadsBtn.addEventListener("click", e => {
    e.stopPropagation();
    toggleOpen(!downloadsMenu.classList.contains("open"));
  });

  // Close on outside click / Esc
  document.addEventListener("click", e => {
    if (!downloadsMenu.classList.contains("open")) return;
    const root = document.getElementById("downloadsRoot");
    if (root && !root.contains(e.target)) toggleOpen(false);
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") toggleOpen(false);
  });

  placeDownloadsMenu();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[ch]);
}

document.addEventListener("DOMContentLoaded", () => {
  setupDownloadsMenu();
});