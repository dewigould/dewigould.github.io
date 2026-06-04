// Animated mountaineer that climbs the name heading: up the first letter,
// across the top, and down the last letter. Plays once on load and replays on
// hover. Uses CSS offset-path; gracefully no-ops where unsupported or when the
// visitor prefers reduced motion.
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.CSS || !CSS.supports || !CSS.supports("offset-path", "path('M 0 0 L 1 1')")) return;

  const DURATION = 3800; // ms for a full climb

  function init() {
    const wrap = document.getElementById("climber-name");
    if (!wrap) return;
    const climber = wrap.querySelector(".climber");
    if (!climber) return;

    let running = false;

    function buildPath() {
      const w = wrap.offsetWidth;
      const h = wrap.offsetHeight;
      // Feet trace: up the left edge, across the top, down the right edge.
      return "path('M 2 " + h + " L 2 2 L " + (w - 2) + " 2 L " + (w - 2) + " " + h + "')";
    }

    function play() {
      if (running) return;
      running = true;
      climber.style.offsetPath = buildPath();
      climber.classList.add("is-climbing");
      const anim = climber.animate(
        [{ offsetDistance: "0%" }, { offsetDistance: "100%" }],
        { duration: DURATION, easing: "ease-in-out", fill: "forwards" }
      );
      anim.onfinish = function () {
        climber.classList.remove("is-climbing");
        climber.style.offsetDistance = "0%";
        running = false;
      };
    }

    wrap.addEventListener("mouseenter", play);

    // Initial climb, once fonts/layout have settled so the path is accurate.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        setTimeout(play, 400);
      });
    } else {
      setTimeout(play, 600);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
