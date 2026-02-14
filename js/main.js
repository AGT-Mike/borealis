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
      // nav.classList.add("md:bg-black/80", "md:shadow-sm", "md:backdrop-blur-sm");
      // nav.classList.remove("md:bg-transparent");
    } else {
      // nav.classList.remove("md:bg-black/80", "md:shadow-sm", "md:backdrop-blur-sm");
      // nav.classList.add("md:bg-transparent");
    }
  } else {
    // Mobile: always solid dark
    // nav.classList.remove("md:bg-black/90", "md:shadow-sm", "md:backdrop-blur-sm", "md:bg-transparent");
    // nav.classList.add("bg-black/90");
  }
}
// setNavBg();
// window.addEventListener("scroll", setNavBg, { passive: true });
// window.addEventListener("resize", () => {
//   setNavBg();
//   // If we resize up to desktop, make sure the mobile overlay is closed
//   if (isDesktop()) closeMobileOverlay();
// });

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
   HERO VIDEO MODAL (YouTube)
   ─────────────────────────────────────────── */
const modal      = document.getElementById("videoModal");
const modalBtn   = document.getElementById("videoModalBtn");
const modalBtnMobile = document.getElementById("videoModalBtnMobile");
const closeBtn   = document.getElementById("closeModalBtn");
const ytPlayer   = document.getElementById("ytPlayer");

// Use & between params (NOT a second ?)
const VIDEO_ID = "9UZBnVevPKU";
const YT_URL =
  `https://www.youtube.com/embed/${VIDEO_ID}` +
  `?autoplay=1&mute=0&playsinline=1&rel=0&modestbranding=1&origin=${location.origin}`;

function openModal() {
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("grid", "place-items-center");
  ytPlayer.src = YT_URL; // load + autoplay (muted) after user click
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("grid", "place-items-center");
  ytPlayer.src = ""; // clear to stop playback fully
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}

modalBtn?.addEventListener("click", openModal);
modalBtnMobile?.addEventListener("click", () => {
  closeMobileOverlay();
  openModal();
});
closeBtn?.addEventListener("click", closeModal);
modal?.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
});

// ─────────────────────────────
// Desktop dropdown: tap/keyboard support (iPad, touch laptops)
// ─────────────────────────────
document.querySelectorAll('[data-dropdown]').forEach(drop => {
  const btn  = drop.querySelector('button');
  const menu = drop.querySelector('[data-menu]');
  if (!btn || !menu) return;

  // Toggle on click/tap
  btn.addEventListener('click', (e) => {
    // If already open via click, close; otherwise open.
    const willOpen = !menu.classList.contains('open');
    // Close other open dropdowns at this level
    document.querySelectorAll('[data-dropdown] [data-menu].open').forEach(m => {
      if (m !== menu) m.classList.remove('open');
    });
    menu.classList.toggle('open', willOpen);
    btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    e.stopPropagation();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('open')) return;
    if (!drop.contains(e.target)) {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });

  // Close when a menu link is chosen
  menu.querySelectorAll('a[href]').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
});
