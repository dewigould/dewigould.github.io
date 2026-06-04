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
  const BASE_OPACITY = 0.2; // starting opacity of a fresh print (kept faint)

  // Hiking-boot sole imprint: stacked tread lugs, widest at the ball, pinched
  // at the arch, rounded heel. Points "up" by default.
  const FOOT_SVG =
    '<svg width="13" height="26" viewBox="0 0 32 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
    '<rect x="8" y="1" width="16" height="6" rx="3"/>' +
    '<rect x="5" y="9" width="22" height="6" rx="3"/>' +
    '<rect x="4" y="17" width="24" height="6" rx="3"/>' +
    '<rect x="5" y="25" width="22" height="6" rx="3"/>' +
    '<rect x="8" y="33" width="16" height="6" rx="3"/>' +
    '<rect x="6" y="41" width="20" height="6" rx="3"/>' +
    '<rect x="5" y="49" width="22" height="6" rx="3"/>' +
    '<rect x="7" y="57" width="18" height="6" rx="3"/>' +
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
    print.firstChild.style.fill = "currentColor";
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
