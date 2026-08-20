(() => {
  "use strict";

  // Ativa as animações somente quando o JavaScript estiver funcionando.
  // Assim, se o JS falhar, o conteúdo continua visível.
  document.documentElement.classList.add("js-ready");

  const canvas = document.getElementById("starfield");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const backTop = document.getElementById("backTop");
  const year = document.getElementById("year");

  // Ano atual no footer
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // =========================================================
  // CAMPO DE ESTRELAS
  // =========================================================

  let stars = [];
  let width = 0;
  let height = 0;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    if (!canvas || !ctx) return;

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(
      180,
      Math.floor((width * height) / 8000)
    );

    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.25 + 0.2,
      alpha: Math.random() * 0.65 + 0.12,
      drift: (Math.random() - 0.5) * 0.12,
      twinkle: Math.random() * Math.PI * 2
    }));
  }

  function drawStars(time = 0) {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, width, height);

    stars.forEach((star) => {
      star.y += star.drift;

      // Faz as estrelas reaparecerem quando saem da tela
      if (star.y > height + 4) {
        star.y = -4;
      }

      if (star.y < -4) {
        star.y = height + 4;
      }

      // Pequena variação de brilho
      const alpha = Math.max(
        0.04,
        star.alpha +
          Math.sin(
            time * 0.0015 + star.twinkle
          ) * 0.08
      );

      ctx.beginPath();

      ctx.arc(
        star.x,
        star.y,
        star.radius,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = `rgba(210, 225, 255, ${alpha})`;

      ctx.fill();
    });

    requestAnimationFrame(drawStars);
  }

  // Não executa animações se o usuário tiver
  // preferência por reduzir movimento.
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (canvas && ctx && !reducedMotion) {
    resizeCanvas();

    requestAnimationFrame(drawStars);

    window.addEventListener(
      "resize",
      resizeCanvas,
      { passive: true }
    );
  }

  // =========================================================
  // ANIMAÇÃO DE ENTRADA DAS SEÇÕES
  // =========================================================

  const revealElements =
    document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(
                "is-visible"
              );

              revealObserver.unobserve(
                entry.target
              );
            }
          });
        },
        {
          threshold: 0.08
        }
      );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    // Fallback para navegadores sem IntersectionObserver
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  // =========================================================
  // BOTÃO VOLTAR AO TOPO
  // =========================================================

  function updateBackTop() {
    if (!backTop) return;

    if (window.scrollY > 700) {
      backTop.classList.add("visible");
    } else {
      backTop.classList.remove("visible");
    }
  }

  window.addEventListener(
    "scroll",
    updateBackTop,
    { passive: true }
  );

  updateBackTop();

  if (backTop) {
    backTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  // =========================================================
  // MOVIMENTO SUTIL DO PAINEL ESPACIAL
  // =========================================================

  const orbitPanel =
    document.querySelector(".orbit-panel");

  if (orbitPanel && !reducedMotion) {
    orbitPanel.addEventListener(
      "pointermove",
      (event) => {
        const rect =
          orbitPanel.getBoundingClientRect();

        const x =
          (event.clientX - rect.left) /
            rect.width -
          0.5;

        const y =
          (event.clientY - rect.top) /
            rect.height -
          0.5;

        orbitPanel.style.transform =
          `perspective(900px)
           rotateX(${y * -3}deg)
           rotateY(${x * 3}deg)`;
      }
    );

    orbitPanel.addEventListener(
      "pointerleave",
      () => {
        orbitPanel.style.transform = "";
      }
    );
  }
})();
