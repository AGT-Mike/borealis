import "../css/style.css";

/* ─────────────────────────────────────────────
   NAV: scroll glass effect + mobile toggle
   ───────────────────────────────────────────── */
const nav = document.getElementById("mainNav");
const navToggle = document.getElementById("navToggle");
const mobileMenu = document.getElementById("mobileMenu");
const bar1 = document.getElementById("bar1");
const bar2 = document.getElementById("bar2");
const bar3 = document.getElementById("bar3");

let mobileOpen = false;

function setNavScrolled() {
  if (!nav) return;
  nav.classList.toggle("scrolled", window.scrollY > 40);
}
setNavScrolled();
window.addEventListener("scroll", setNavScrolled, { passive: true });

function openMobile() {
  mobileOpen = true;
  mobileMenu.classList.remove("hidden");
  mobileMenu.classList.add("flex");
  bar1.style.transform = "rotate(45deg) translate(2px, 2px)";
  bar2.style.opacity = "0";
  bar3.style.transform = "rotate(-45deg) translate(2px, -2px)";
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function closeMobile() {
  mobileOpen = false;
  mobileMenu.classList.add("hidden");
  mobileMenu.classList.remove("flex");
  bar1.style.transform = "";
  bar2.style.opacity = "";
  bar3.style.transform = "";
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}

navToggle?.addEventListener("click", () => {
  mobileOpen ? closeMobile() : openMobile();
});

// Close mobile menu on link click
mobileMenu?.querySelectorAll("a[href]").forEach((a) => {
  a.addEventListener("click", closeMobile);
});

// Close on resize to desktop
window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024 && mobileOpen) closeMobile();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileOpen) closeMobile();
});

/* ─────────────────────────────────────────────
   REVEAL ON SCROLL
   ───────────────────────────────────────────── */
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initReveals() {
  const els = document.querySelectorAll(
    ".reveal-up, .reveal-left, .reveal-right, .reveal-scale"
  );
  if (!els.length) return;

  if (prefersReduced) {
    els.forEach((el) => el.classList.add("visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  els.forEach((el) => io.observe(el));
}
initReveals();

/* ─────────────────────────────────────────────
   COUNTER ANIMATION
   ───────────────────────────────────────────── */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = target * eased;
    el.textContent = val.toFixed(decimals);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statsBar = document.getElementById("statsBar");
if (statsBar) {
  const counters = statsBar.querySelectorAll(".counter");
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          counters.forEach(animateCounter);
          obs.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );
  io.observe(statsBar);
}

/* ─────────────────────────────────────────────
   VIDEO MODAL (YouTube)
   ───────────────────────────────────────────── */
const modal = document.getElementById("videoModal");
const ytPlayer = document.getElementById("ytPlayer");
const closeBtn = document.getElementById("closeModalBtn");

const VIDEO_ID = "9UZBnVevPKU";
const YT_URL =
  `https://www.youtube.com/embed/${VIDEO_ID}` +
  `?autoplay=1&mute=0&playsinline=1&rel=0&modestbranding=1&origin=${location.origin}`;

function openVideoModal() {
  if (!modal) return;
  modal.classList.remove("hidden");
  ytPlayer.src = YT_URL;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
}

function closeVideoModal() {
  if (!modal) return;
  modal.classList.add("hidden");
  ytPlayer.src = "";
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
}

// All video trigger buttons
document.getElementById("heroVideoBtn")?.addEventListener("click", openVideoModal);
document.getElementById("videoCTABtn")?.addEventListener("click", openVideoModal);
closeBtn?.addEventListener("click", closeVideoModal);

modal?.addEventListener("click", (e) => {
  if (e.target === modal || e.target.closest(".video-overlay") === modal && !e.target.closest(".max-w-4xl")) {
    closeVideoModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
    closeVideoModal();
  }
});

/* ─────────────────────────────────────────────
   SMOOTH SCROLL for nav links (offset for fixed nav)
   ───────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    // Update URL without jump
    history.pushState(null, "", id);
  });
});
