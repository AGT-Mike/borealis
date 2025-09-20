import "/css/style.css";

/* ───────────────────────────────────────────
   NAV: desktop scroll styles
   ─────────────────────────────────────────── */
const nav         = document.getElementById("mainNavbar");
const navToggle   = document.getElementById("navToggle");
const navLinks    = document.getElementById("navLinks"); // desktop links (md+)
const mobileMenu  = document.getElementById("mobileMenu"); // mobile overlay

function isDesktop() {
  return window.innerWidth >= 768; // Tailwind md
}

function lockBodyScroll(lock) {
  document.documentElement.style.overflow = lock ? "hidden" : "";
  document.body.style.overflow = lock ? "hidden" : "";
}

function setNavBg() {
  if (!nav) return;

  if (isDesktop()) {
    // Desktop: transparent at top, dark on scroll
    if (window.scrollY > 50) {
      nav.classList.add("md:bg-black/80", "md:shadow-sm", "md:backdrop-blur-sm");
      nav.classList.remove("md:bg-transparent");
    } else {
      nav.classList.remove("md:bg-black/80", "md:shadow-sm", "md:backdrop-blur-sm");
      // nav.classList.add("md:bg-transparent");
    }
  } else {
    // Mobile: always solid dark
    nav.classList.remove("md:bg-black/90", "md:shadow-sm", "md:backdrop-blur-sm", "md:bg-transparent");
    nav.classList.add("bg-black/80");
  }
}
setNavBg();
window.addEventListener("scroll", setNavBg, { passive: true });
window.addEventListener("resize", () => {
  setNavBg();
  // If we resize up to desktop, make sure the mobile overlay is closed
  if (isDesktop()) closeMobileOverlay();
});

/* ───────────────────────────────────────────
   MOBILE OVERLAY MENU (hamburger)
   ─────────────────────────────────────────── */
function openMobileOverlay() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove("hidden");
  lockBodyScroll(true);
}
function closeMobileOverlay() {
  if (!mobileMenu) return;
  mobileMenu.classList.add("hidden");
  lockBodyScroll(false);
}

navToggle?.addEventListener("click", () => {
  if (!mobileMenu) return;
  const isHidden = mobileMenu.classList.contains("hidden");
  isHidden ? openMobileOverlay() : closeMobileOverlay();
});

// Close overlay when a link is clicked (anchors only)
mobileMenu?.querySelectorAll("a[href]").forEach(a => {
  a.addEventListener("click", () => closeMobileOverlay());
});

// Close on Esc
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileMenu && !mobileMenu.classList.contains("hidden")) {
    closeMobileOverlay();
  }
});

// Close when tapping the backdrop (outside inner <nav>)
mobileMenu?.addEventListener("click", (e) => {
  if (e.target === mobileMenu) closeMobileOverlay();
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
    els.forEach(el => el.classList.remove("opacity-0", "translate-y-6"));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const idx = Array.from(el.parentElement.children).indexOf(el);
      el.style.transitionDelay = `${Math.min(idx * 80, 400)}ms`;
      el.classList.add("opacity-100", "translate-y-0", "duration-700", "ease-out", "will-change-transform", "will-change-opacity");
      el.classList.remove("opacity-0", "translate-y-6");
      obs.unobserve(el);
    });
  }, { threshold: 0.18 });

  els.forEach(el => io.observe(el));
}
revealOnScroll();

/* ───────────────────────────────────────────
   HERO VIDEO MODAL
   ─────────────────────────────────────────── */
const modal      = document.getElementById("videoModal");
const modalBtn   = document.getElementById("videoModalBtn");
const closeBtn   = document.getElementById("closeModalBtn");
const modalVideo = document.getElementById("modalVideo");

function openModal() {
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("grid", "place-items-center");
  try { modalVideo?.play?.(); } catch {}
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("grid", "place-items-center");
  if (modalVideo) {
    try { modalVideo.pause(); } catch {}
    modalVideo.currentTime = 0;
  }
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}

modalBtn?.addEventListener("click", openModal);
closeBtn?.addEventListener("click", closeModal);

// Close on backdrop click
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Close on Esc
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
    closeModal();
  }
});