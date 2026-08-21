(() => {
  "use strict";

  // =========================================================
  // ESTADO INICIAL
  // =========================================================

  document.documentElement.classList.add("js-ready");

  const canvas = document.getElementById("starfield");
  const ctx = canvas
    ? canvas.getContext("2d")
    : null;

  const backTop =
    document.getElementById("backTop");

  const year =
    document.getElementById("year");

  const planet =
    document.querySelector(".planet");


  // =========================================================
  // ANO DO FOOTER
  // =========================================================

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }


  // =========================================================
  // CAMPO DE ESTRELAS
  // =========================================================

  let stars = [];

  let width = 0;
  let height = 0;

  const dpr =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );


  function resizeCanvas() {

    if (!canvas || !ctx) {
      return;
    }

    width =
      window.innerWidth;

    height =
      window.innerHeight;


    canvas.width =
      Math.floor(
        width * dpr
      );

    canvas.height =
      Math.floor(
        height * dpr
      );


    canvas.style.width =
      `${width}px`;

    canvas.style.height =
      `${height}px`;


    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );


    const count =
      Math.min(
        180,
        Math.floor(
          (width * height) / 8000
        )
      );


    stars =
      Array.from(
        {
          length: count
        },
        () => ({
          x:
            Math.random() *
            width,

          y:
            Math.random() *
            height,

          radius:
            Math.random() *
            1.25 +
            0.2,

          alpha:
            Math.random() *
              0.65 +
            0.12,

          drift:
            (Math.random() - 0.5) *
            0.12,

          twinkle:
            Math.random() *
            Math.PI *
            2
        })
      );
  }


  function drawStars(time = 0) {

    if (!canvas || !ctx) {
      return;
    }


    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    stars.forEach(
      (star) => {

        star.y +=
          star.drift;


        if (
          star.y >
          height + 4
        ) {
          star.y = -4;
        }


        if (
          star.y <
          -4
        ) {
          star.y =
            height + 4;
        }


        const alpha =
          Math.max(
            0.04,
            star.alpha +
              Math.sin(
                time *
                  0.0015 +
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
          `rgba(
            210,
            225,
            255,
            ${alpha}
          )`;


        ctx.fill();
      }
    );


    requestAnimationFrame(
      drawStars
    );
  }


  // =========================================================
  // REDUÇÃO DE MOVIMENTO
  // =========================================================

  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  // =========================================================
  // INICIALIZA ESTRELAS
  // =========================================================

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
  // ANIMAÇÃO DE ENTRADA
  // =========================================================

  const revealElements =
    document.querySelectorAll(
      ".reveal"
    );


  if (
    "IntersectionObserver"
    in window
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

    if (!backTop) {
      return;
    }


    if (
      window.scrollY > 700
    ) {

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
  // - gira sozinho;
  // - pode ser arrastado;
  // - mantém o impulso após soltar;
  // - funciona com mouse;
  // - funciona com touch;
  // - volta a girar sozinho depois.
  // =========================================================

  if (
    planet &&
    !reducedMotion
  ) {

    let rotation = 0;

    let velocity = 0.08;

    let dragging = false;

    let pointerId = null;

    let lastX = 0;

    let lastTime = 0;

    let idleTimer = null;


    /*
      Velocidade padrão do planeta.

      Positivo = sentido horário.
    */

    const AUTO_SPEED = 0.08;


    /*
      Quanto o movimento do mouse
      influencia a rotação.
    */

    const DRAG_SENSITIVITY = 0.45;


    /*
      Atrito.

      Quanto mais próximo de 1,
      mais tempo o planeta continua
      girando depois de solto.
    */

    const FRICTION = 0.96;


    /*
      Depois de ficar parado,
      o planeta volta lentamente
      ao movimento automático.
    */

    const AUTO_RESUME_DELAY = 1800;


    // -------------------------------------------------------
    // APLICA A ROTAÇÃO
    // -------------------------------------------------------

    function renderPlanet() {

      planet.style.transform =
        `rotate(${rotation}deg)`;

    }


    // -------------------------------------------------------
    // INICIA ROTAÇÃO AUTOMÁTICA
    // -------------------------------------------------------

    function resumeAutoRotation() {

      velocity =
        AUTO_SPEED;

    }


    // -------------------------------------------------------
    // TIMER PARA RETOMAR AUTO-ROTAÇÃO
    // -------------------------------------------------------

    function scheduleAutoRotation() {

      clearTimeout(
        idleTimer
      );


      idleTimer =
        setTimeout(
          () => {

            resumeAutoRotation();

          },
          AUTO_RESUME_DELAY
        );

    }


    // -------------------------------------------------------
    // POINTER DOWN
    // -------------------------------------------------------

    planet.addEventListener(
      "pointerdown",
      (event) => {

        dragging = true;

        pointerId =
          event.pointerId;

        lastX =
          event.clientX;

        lastTime =
          performance.now();


        velocity = 0;


        planet.classList.add(
          "is-dragging"
        );


        planet.setPointerCapture(
          pointerId
        );


        clearTimeout(
          idleTimer
        );


        event.preventDefault();

      }
    );


    // -------------------------------------------------------
    // POINTER MOVE
    // -------------------------------------------------------

    planet.addEventListener(
      "pointermove",
      (event) => {

        if (
          !dragging ||
          event.pointerId !==
            pointerId
        ) {
          return;
        }


        const now =
          performance.now();


        const deltaX =
          event.clientX -
          lastX;


        const deltaTime =
          Math.max(
            now - lastTime,
            1
          );


        /*
          Movimento horizontal
          controla a rotação.
        */

        rotation +=
          deltaX *
          DRAG_SENSITIVITY;


        /*
          Calcula a velocidade
          para gerar o impulso.
        */

        velocity =
          (
            deltaX /
            deltaTime
          ) *
          16 *
          DRAG_SENSITIVITY;


        /*
          Limita velocidades exageradas.
        */

        velocity =
          Math.max(
            -2.5,
            Math.min(
              2.5,
              velocity
            )
          );


        lastX =
          event.clientX;

        lastTime =
          now;


        renderPlanet();

      }
    );


    // -------------------------------------------------------
    // POINTER UP
    // -------------------------------------------------------

    function releasePlanet(event) {

      if (
        !dragging ||
        event.pointerId !==
          pointerId
      ) {
        return;
      }


      dragging = false;

      pointerId = null;


      planet.classList.remove(
        "is-dragging"
      );


      /*
        Depois do impulso,
        começa a desacelerar.
      */

      scheduleAutoRotation();

    }


    planet.addEventListener(
      "pointerup",
      releasePlanet
    );


    planet.addEventListener(
      "pointercancel",
      releasePlanet
    );


    planet.addEventListener(
      "lostpointercapture",
      () => {

        if (dragging) {

          dragging = false;

          planet.classList.remove(
            "is-dragging"
          );

          scheduleAutoRotation();

        }

      }
    );


    // -------------------------------------------------------
    // LOOP DO PLANETA
    // -------------------------------------------------------

    let lastFrame =
      performance.now();


    function animatePlanet(
      currentTime
    ) {

      const delta =
        Math.min(
          currentTime -
            lastFrame,
          32
        );


      lastFrame =
        currentTime;


      /*
        Só aplica a física quando
        o usuário não está arrastando.
      */

      if (!dragging) {

        rotation +=
          velocity *
          (delta / 16);


        /*
          Aplica atrito.

          Isso cria aquele efeito de
          "soltar o planeta e ele continuar".
        */

        if (
          Math.abs(velocity) >
          AUTO_SPEED
        ) {

          velocity *=
            Math.pow(
              FRICTION,
              delta / 16
            );

        } else {

          /*
            Quando desacelerar,
            volta para a velocidade
            automática.
          */

          const difference =
            AUTO_SPEED -
            velocity;


          velocity +=
            difference *
            0.025;

        }


        renderPlanet();

      }


      requestAnimationFrame(
        animatePlanet
      );

    }


    /*
      Remove a animação CSS automática,
      porque agora o JS controla tudo.
    */

    planet.style.animation =
      "none";


    requestAnimationFrame(
      animatePlanet
    );

  }


  // =========================================================
  // MOVIMENTO SUTIL DO PAINEL ESPACIAL
  // =========================================================

  const orbitPanel =
    document.querySelector(
      ".orbit-panel"
    );


  /*
    O painel não deve interferir
    quando estamos interagindo com
    o planeta.
  */

  if (
    orbitPanel &&
    !reducedMotion
  ) {

    orbitPanel.addEventListener(
      "pointermove",
      (event) => {

        if (
          planet &&
          (
            event.target === planet ||
            planet.contains(
              event.target
            )
          )
        ) {
          return;
        }


        const rect =
          orbitPanel.getBoundingClientRect();


        const x =
          (
            event.clientX -
            rect.left
          ) /
            rect.width -
          0.5;


        const y =
          (
            event.clientY -
            rect.top
          ) /
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

        orbitPanel.style.transform =
          "";

      }
    );

  }

})();
