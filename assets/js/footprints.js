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
  const BASE_OPACITY = 0.12; // starting opacity of a fresh print (very faint)

  // Muddy hiking-boot sole imprint: rounded toe, wide ball, pinched instep,
  // rounded heel, with a little mud splatter. Points "up" by default.
  const FOOT_SVG =
    '<svg width="13" height="26" viewBox="0 0 32 64" fill="#6b4f30" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M16 2 C23 2 27 8 27 18 C27 26 25 30 24 36 C23.5 42 25 48 25 54 C25 60 21 63 16 63 C11 63 7 60 7 54 C7 48 8.5 42 8 36 C7 30 5 26 5 18 C5 8 9 2 16 2 Z"/>' +
    '<circle cx="29" cy="22" r="1.4" opacity="0.8"/>' +
    '<circle cx="3" cy="40" r="1.6" opacity="0.7"/>' +
    '<circle cx="27" cy="58" r="1.2" opacity="0.7"/>' +
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
