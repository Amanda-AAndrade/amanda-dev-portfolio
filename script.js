(() => {
  "use strict";

  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  document.documentElement.classList.add("js-ready");

  const canvas = document.getElementById("starfield");
  const ctx = canvas ? canvas.getContext("2d") : null;

  const backTop = document.getElementById("backTop");
  const year = document.getElementById("year");

  const planet = document.querySelector(".planet");
  const orbitPanel = document.querySelector(".orbit-panel");


  // =========================================================
  // ANO DO FOOTER
  // =========================================================

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  // =========================================================
  // PREFERÊNCIA POR REDUÇÃO DE MOVIMENTO
  // =========================================================

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  // =========================================================
  // CAMPO DE ESTRELAS
  // =========================================================

  let stars = [];

  let width = 0;
  let height = 0;

  const dpr = Math.min(
    window.devicePixelRatio || 1,
    2
  );


  function resizeCanvas() {
    if (!canvas || !ctx) return;

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );


    const count = Math.min(
      180,
      Math.floor(
        (width * height) / 8000
      )
    );


    stars = Array.from(
      { length: count },
      () => ({
        x: Math.random() * width,

        y: Math.random() * height,

        radius:
          Math.random() * 1.25 + 0.2,

        alpha:
          Math.random() * 0.65 + 0.12,

        drift:
          (Math.random() - 0.5) * 0.12,

        twinkle:
          Math.random() *
          Math.PI *
          2
      })
    );
  }


  function drawStars(time = 0) {
    if (!canvas || !ctx) return;

    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    stars.forEach((star) => {

      star.y += star.drift;


      if (star.y > height + 4) {
        star.y = -4;
      }


      if (star.y < -4) {
        star.y = height + 4;
      }


      const alpha = Math.max(
        0.04,

        star.alpha +
          Math.sin(
            time * 0.0015 +
            star.twinkle
          ) *
          0.08
      );


      ctx.beginPath();


      ctx.arc(
        star.x,
        star.y,
        star.radius,
        0,
        Math.PI * 2
      );


      ctx.fillStyle =
        `rgba(210, 225, 255, ${alpha})`;

      ctx.fill();

    });


    requestAnimationFrame(drawStars);
  }


  if (
    canvas &&
    ctx &&
    !reducedMotion
  ) {

    resizeCanvas();

    requestAnimationFrame(
      drawStars
    );

    window.addEventListener(
      "resize",
      resizeCanvas,
      {
        passive: true
      }
    );

  }


  // =========================================================
  // REVEAL DAS SEÇÕES
  // =========================================================

  const revealElements =
    document.querySelectorAll(
      ".reveal"
    );


  if (
    "IntersectionObserver" in window
  ) {

    const revealObserver =
      new IntersectionObserver(
        (entries) => {

          entries.forEach(
            (entry) => {

              if (
                entry.isIntersecting
              ) {

                entry.target.classList.add(
                  "is-visible"
                );


                revealObserver.unobserve(
                  entry.target
                );

              }

            }
          );

        },
        {
          threshold: 0.08
        }
      );


    revealElements.forEach(
      (element) => {
        revealObserver.observe(
          element
        );
      }
    );

  } else {

    revealElements.forEach(
      (element) => {

        element.classList.add(
          "is-visible"
        );

      }
    );

  }


  // =========================================================
  // BOTÃO VOLTAR AO TOPO
  // =========================================================

  function updateBackTop() {

    if (!backTop) return;


    if (window.scrollY > 700) {

      backTop.classList.add(
        "visible"
      );

    } else {

      backTop.classList.remove(
        "visible"
      );

    }

  }


  window.addEventListener(
    "scroll",
    updateBackTop,
    {
      passive: true
    }
  );


  updateBackTop();


  if (backTop) {

    backTop.addEventListener(
      "click",
      () => {

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      }
    );

  }


  // =========================================================
  // PLANETA INTERATIVO
  //
  // O planeta:
  // 1. gira sozinho;
  // 2. pode ser arrastado pelo mouse;
  // 3. pode ser arrastado pelo touch;
  // 4. recebe impulso quando solto;
  // 5. volta gradualmente para a rotação automática.
  // =========================================================

  if (
    planet &&
    !reducedMotion
  ) {

    let rotationX = 0;
    let rotationY = 0;

    let velocityX = 0;
    let velocityY = 0;

    let isDragging = false;

    let lastX = 0;
    let lastY = 0;

    let lastTime = 0;


    const autoRotation = 0.018;

    const friction = 0.94;

    const maxVelocity = 1.8;


    function normalizeVelocity(value) {

      return Math.max(
        -maxVelocity,
        Math.min(
          maxVelocity,
          value
        )
      );

    }


    function applyPlanetTransform() {

      planet.style.transform =
        `
        rotateX(${rotationX}deg)
        rotateY(${rotationY}deg)
        `;

    }


    function animatePlanet(time) {

      const delta =
        lastTime
          ? Math.min(
              time - lastTime,
              32
            )
          : 16;


      lastTime = time;


      if (!isDragging) {

        // Rotação automática
        rotationY +=
          autoRotation *
          delta;


        // Mantém o impulso do arraste
        rotationY +=
          velocityY *
          delta;


        rotationX +=
          velocityX *
          delta;


        // Redução gradual do impulso
        velocityX *= friction;
        velocityY *= friction;

      }


      applyPlanetTransform();


      requestAnimationFrame(
        animatePlanet
      );

    }


    function pointerDown(event) {

      isDragging = true;

      planet.classList.add(
        "is-dragging"
      );


      lastX =
        event.clientX;

      lastY =
        event.clientY;


      velocityX = 0;
      velocityY = 0;


      if (
        planet.setPointerCapture
      ) {

        planet.setPointerCapture(
          event.pointerId
        );

      }

    }


    function pointerMove(event) {

      if (!isDragging) return;


      const currentX =
        event.clientX;

      const currentY =
        event.clientY;


      const deltaX =
        currentX - lastX;

      const deltaY =
        currentY - lastY;


      // Sensibilidade do giro
      rotationY +=
        deltaX * 0.45;

      rotationX -=
        deltaY * 0.30;


      // Limita a inclinação vertical
      rotationX =
        Math.max(
          -35,
          Math.min(
            35,
            rotationX
          )
        );


      // Guarda velocidade para o impulso
      velocityY =
        normalizeVelocity(
          deltaX * 0.035
        );

      velocityX =
        normalizeVelocity(
          -deltaY * 0.025
        );


      lastX = currentX;
      lastY = currentY;


      applyPlanetTransform();

    }


    function pointerUp(event) {

      if (!isDragging) return;


      isDragging = false;

      planet.classList.remove(
        "is-dragging"
      );


      if (
        planet.releasePointerCapture
      ) {

        try {

          planet.releasePointerCapture(
            event.pointerId
          );

        } catch (error) {
          // Pointer já pode ter sido liberado.
        }

      }

    }


    planet.addEventListener(
      "pointerdown",
      pointerDown
    );


    planet.addEventListener(
      "pointermove",
      pointerMove
    );


    planet.addEventListener(
      "pointerup",
      pointerUp
    );


    planet.addEventListener(
      "pointercancel",
      pointerUp
    );


    planet.addEventListener(
      "pointerleave",
      (event) => {

        if (
          isDragging &&
          event.pointerType === "mouse"
        ) {

          // Não interrompe o arraste:
          // o pointer capture mantém o controle.

        }

      }
    );


    requestAnimationFrame(
      animatePlanet
    );

  }


  // =========================================================
  // MOVIMENTO SUTIL DO PAINEL ESPACIAL
  // =========================================================

  if (
    orbitPanel &&
    !reducedMotion
  ) {

    orbitPanel.addEventListener(
      "pointermove",
      (event) => {

        // Não aplica tilt no painel
        // enquanto o usuário está girando o planeta.
        if (
          planet &&
          planet.classList.contains(
            "is-dragging"
          )
        ) {
          return;
        }


        const rect =
          orbitPanel.getBoundingClientRect();


        const x =
          (event.clientX -
            rect.left) /
            rect.width -
          0.5;


        const y =
          (event.clientY -
            rect.top) /
            rect.height -
          0.5;


        orbitPanel.style.transform =
          `
          perspective(900px)
          rotateX(${y * -3}deg)
          rotateY(${x * 3}deg)
          `;

      }
    );


    orbitPanel.addEventListener(
      "pointerleave",
      () => {

        orbitPanel.style.transform =
          "";

      }
    );

  }

})();
