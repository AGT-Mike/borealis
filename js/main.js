import "/css/style.css";

// Mobile nav toggle
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");
toggle?.addEventListener("click", () => {
  links?.classList.toggle("hidden");
  links?.classList.toggle("flex");
  links?.classList.add("flex-col", "absolute", "top-20", "left-0", "w-full", "bg-black/95", "p-4", "space-y-4");
});

// Change navbar background on scroll
const nav = document.getElementById("mainNavbar");
const setNavBg = () => {
  if (!nav) return;
  nav.classList.toggle("bg-black/90", window.scrollY > 50);
  nav.classList.toggle("bg-transparent", window.scrollY <= 50);
};
setNavBg();
window.addEventListener("scroll", setNavBg);

// Close mobile menu after clicking a nav link
document.querySelectorAll('#navLinks a[href^="#"]').forEach(a => {
  a.addEventListener('click', () => {
    const links = document.getElementById('navLinks');
    if (links && getComputedStyle(links).position === 'absolute') {
      links.classList.add('hidden');
      links.classList.remove('flex');
    }
  });
});

// Counter animation for #learnMore
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const duration = parseInt(el.dataset.duration || "1000", 10);
  const start = performance.now();
  const startVal = 0;

  function tick(now) {
    const p = Math.min(1, (now - start) / duration);
    const val = startVal + (target - startVal) * p;
    el.textContent = val.toFixed(decimals).replace(/\.0+$/, "");
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const learnMore = document.getElementById("learnMore");
if (learnMore) {
  const counters = learnMore.querySelectorAll(".counter");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        counters.forEach(animateCounter);
        io.disconnect();
      }
    });
  }, { threshold: 0.25 });
  io.observe(learnMore);
}

// Reveal-on-scroll for .reveal cards (respects reduced motion)
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function revealOnScroll() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  if (prefersReduced) {
    // Show immediately if user prefers reduced motion
    els.forEach(el => el.classList.remove('opacity-0', 'translate-y-6'));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;

        // Optional: stagger based on index
        const idx = Array.from(el.parentElement.children).indexOf(el);
        el.style.transitionDelay = `${Math.min(idx * 80, 400)}ms`;

        // Transition in
        el.classList.add('opacity-100', 'translate-y-0');
        el.classList.remove('opacity-0', 'translate-y-6');

        // Smooth transition config
        el.classList.add('duration-700', 'ease-out', 'will-change-transform', 'will-change-opacity');

        obs.unobserve(el);
      }
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
}

revealOnScroll();

async function setupDownloadsMenu() {
  const btn = document.getElementById("downloadsBtn");
  const menu = document.getElementById("downloadsMenu");
  const list = document.getElementById("pdfMenuList");
  if (!btn || !menu || !list) return;

  // Load manifest
  try {
    const res = await fetch("/pdfs.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = await res.json();

    if (!Array.isArray(items) || items.length === 0) {
      list.innerHTML = `<div class="px-4 py-3 text-sm opacity-70">No downloads available.</div>`;
    } else {
      list.innerHTML = items
        .map(
          ({ name, url }) => `
          <a href="${url}" class="block px-4 py-2.5 text-sm hover:bg-white/10">
            ${escapeHtml(name)}
          </a>`
        )
        .join("");
    }
  } catch (e) {
    console.error("Failed to load /pdfs.json", e);
    list.innerHTML = `<div class="px-4 py-3 text-sm text-red-300">Failed to load downloads.</div>`;
  }

  // Toggle open/close
  const toggle = (open) => {
    menu.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggle(!menu.classList.contains("open"));
  });

  // Close on outside click / Escape
  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("open")) return;
    const root = document.getElementById("downloadsRoot");
    if (root && !root.contains(e.target)) toggle(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggle(false);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}

document.addEventListener("DOMContentLoaded", () => {
  setupDownloadsMenu();
});
