// Footprint cursor trail: drops alternating left/right boot prints that follow
// the cursor's direction of travel and fade out. Subtle, theme-aware, and
// disabled for touch devices and users who prefer reduced motion.
(function () {
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  if (reduceMotion || coarsePointer) return;

  const STEP_DISTANCE = 45; // px the cursor must travel before the next print
  const STRIDE = 9; // px lateral offset between left and right feet
  const LIFETIME = 1600; // ms until a print has fully faded
  const BASE_OPACITY = 0.16; // starting opacity of a fresh print (faint)

  // Muddy hiking-boot print: separate forefoot + heel pads with lug tread cut
  // through as transparent grooves (evenodd), plus mud splatter. Points "up".
  const FOOT_SVG =
    '<svg width="13" height="26" viewBox="0 0 32 64" fill="#6b4f30" xmlns="http://www.w3.org/2000/svg">' +
    '<path fill-rule="evenodd" d="' +
    "M16 2 C24 2 27 9 27 18 C27 27 23 34 16 34 C9 34 5 27 5 18 C5 9 8 2 16 2 Z " +
    "M9 9 L23 9 L23 11 L9 11 Z M7 15 L25 15 L25 17 L7 17 Z M7 21 L25 21 L25 23 L7 23 Z M9 27 L23 27 L23 29 L9 29 Z " +
    "M16 40 C22 40 24 45 24 51 C24 57 20 62 16 62 C12 62 8 57 8 51 C8 45 10 40 16 40 Z " +
    "M10 46 L22 46 L22 48 L10 48 Z M10 52 L22 52 L22 54 L10 54 Z M11 57 L21 57 L21 59 L11 59 Z" +
    '"/>' +
    '<circle cx="30" cy="30" r="1.6"/>' +
    '<circle cx="3" cy="44" r="1.8"/>' +
    '<circle cx="28" cy="60" r="1.3"/>' +
    '<circle cx="2" cy="20" r="1.2"/>' +
    "</svg>";

  // Inject the fade keyframes once. A CSS animation (rather than a JS-triggered
  // transition) avoids the single-rAF race where the browser jumps straight to
  // the end state and the print never visibly appears.
  const style = document.createElement("style");
  style.textContent =
    "@keyframes footprintFade{from{opacity:" + BASE_OPACITY + "}to{opacity:0}}";
  document.head.appendChild(style);

  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;";
  document.body.appendChild(container);

  let lastX = null;
  let lastY = null;
  let accumulated = 0;
  let leftFoot = true;

  function place(x, y, angle) {
    const side = leftFoot ? -1 : 1;
    const perp = angle + Math.PI / 2; // perpendicular to direction of travel
    const ox = Math.cos(perp) * STRIDE * side;
    const oy = Math.sin(perp) * STRIDE * side;

    const print = document.createElement("div");
    print.style.cssText =
      "position:absolute;left:" +
      (x + ox) +
      "px;top:" +
      (y + oy) +
      "px;color:var(--global-text-color,#333);animation:footprintFade " +
      LIFETIME +
      "ms ease-out forwards;transform:translate(-50%,-50%) rotate(" +
      (angle + Math.PI / 2) +
      "rad) scaleX(" +
      (leftFoot ? -1 : 1) +
      ");";
    print.innerHTML = FOOT_SVG;
    container.appendChild(print);

    setTimeout(function () {
      print.remove();
    }, LIFETIME);

    leftFoot = !leftFoot;
  }

  document.addEventListener("mousemove", function (e) {
    const x = e.clientX;
    const y = e.clientY;
    if (lastX === null) {
      lastX = x;
      lastY = y;
      return;
    }
    const dx = x - lastX;
    const dy = y - lastY;
    accumulated += Math.hypot(dx, dy);
    if (accumulated >= STEP_DISTANCE) {
      place(x, y, Math.atan2(dy, dx));
      accumulated = 0;
    }
    lastX = x;
    lastY = y;
  });
})();
