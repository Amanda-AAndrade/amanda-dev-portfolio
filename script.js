/* =========================
   MENU ATIVO AO ROLAR
========================= */
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");
const backTop = document.getElementById("backTop");
const year = document.getElementById("year");

year.textContent = new Date().getFullYear();

let stars = [];
let width = 0;
let height = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.min(150, Math.floor((width * height) / 9000));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.2 + .2,
    a: Math.random() * .65 + .1,
    drift: (Math.random() - .5) * .08
  }));
}

function drawStars() {
  ctx.clearRect(0, 0, width, height);

  for (const star of stars) {
    star.y += star.drift;
    if (star.y > height + 4) star.y = -4;
    if (star.y < -4) star.y = height + 4;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(210,225,255,${star.a})`;
    ctx.fill();
  }

  requestAnimationFrame(drawStars);
}

resizeCanvas();
drawStars();
window.addEventListener("resize", resizeCanvas, { passive: true });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

function updateBackTop() {
  backTop.classList.toggle("visible", window.scrollY > 700);
}
window.addEventListener("scroll", updateBackTop, { passive: true });
updateBackTop();

backTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
'''
