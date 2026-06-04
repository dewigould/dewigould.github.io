// Footprint cursor trail: drops alternating left/right boot prints that follow
// the cursor's direction of travel and fade out. Subtle, theme-aware, and
// disabled for touch devices and users who prefer reduced motion.
(function () {
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  if (reduceMotion || coarsePointer) return;

  const STEP_DISTANCE = 45; // px the cursor must travel before the next print
  const STRIDE = 9; // px lateral offset between left and right feet
  const LIFETIME = 1500; // ms until a print has fully faded
  const BASE_OPACITY = 0.4; // starting opacity of a fresh print

  // Boot-sole silhouette (forefoot + heel), pointing "up" by default.
  const FOOT_SVG =
    '<svg width="14" height="22" viewBox="0 0 24 40" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="12" cy="13" rx="9" ry="13"/>' +
    '<ellipse cx="12" cy="34" rx="6.5" ry="6.5"/>' +
    "</svg>";

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
      "px;color:var(--global-text-color,#333);opacity:" +
      BASE_OPACITY +
      ";transition:opacity " +
      LIFETIME +
      "ms ease-out;transform:translate(-50%,-50%) rotate(" +
      (angle + Math.PI / 2) +
      "rad) scaleX(" +
      (leftFoot ? -1 : 1) +
      ");";
    print.innerHTML = FOOT_SVG;
    print.firstChild.style.fill = "currentColor";
    container.appendChild(print);

    requestAnimationFrame(function () {
      print.style.opacity = "0";
    });
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
