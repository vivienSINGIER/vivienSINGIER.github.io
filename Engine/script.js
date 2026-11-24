// =====================================================================
// ENGINE — scroll-drawn level map: the rider follows the reader through
// the systems, lights each checkpoint, derezzes at the goal.
// Shared behaviour: Core/script.js
// =====================================================================
(function levelMap() {
    const map = document.getElementById("map");
    if (!map) return;
    const cps = [...map.querySelectorAll(".checkpoint")];
    let ticking = false;
    function update() {
        ticking = false;
        const r = map.getBoundingClientRect(), mark = innerHeight * .6;   // the "pen" sits 60% down the screen
        const prog = Math.min(1, Math.max(0, (mark - r.top) / r.height));
        map.style.setProperty("--prog", prog.toFixed(4));
        cps.forEach(c => {
            const cr = c.getBoundingClientRect();
            c.classList.toggle("lit", cr.top + cr.height / 2 < mark);
        });
        map.classList.toggle("done", prog >= .995);
    }
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("resize", update);
    update();
})();
