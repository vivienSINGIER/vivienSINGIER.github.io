// Shared helper for the style-lab dummy pages (temporary).
// - hover/focus to play project videos
// - floating switcher to jump between style options

document.querySelectorAll("[data-hover-video]").forEach(card => {
    const video = card.querySelector("video");
    if (!video) return;
    const play = () => { video.play().catch(() => {}); };
    const stop = () => { video.pause(); video.currentTime = 0; };
    card.addEventListener("mouseenter", play);
    card.addEventListener("mouseleave", stop);
    card.addEventListener("focusin", play);
    card.addEventListener("focusout", stop);
});

(function switcher() {
    const pages = [
        ["index.html", "HUB"],
        ["a-grid-1982.html", "A · GRID 1982"],
        ["b-legacy.html", "B · LEGACY"],
        ["c-arcade.html", "C · ARCADE"],
        ["d-ares.html", "D · ARES"],
        ["e-duality.html", "E · DUALITY (A+B)"],
        ["f-arcade-grid.html", "F · ARCADE GRID (E+C)"],
        ["g-arcade-ares.html", "G · F STYLE / D LAYOUT"],
        ["p1-briefing.html", "P1 · BRIEFING"],
        ["p2-split.html", "P2 · SPLIT"],
        ["p3-level-map.html", "P3 · LEVEL MAP"],
    ];
    const here = location.pathname.split("/").pop() || "index.html";
    const bar = document.createElement("nav");
    bar.setAttribute("aria-label", "Style options");
    bar.style.cssText = [
        "position:fixed", "left:50%", "bottom:14px", "transform:translateX(-50%)", "z-index:9999",
        "display:flex", "gap:4px", "padding:4px", "background:rgba(0,0,0,.85)",
        "border:1px solid #444", "border-radius:6px", "font:600 11px/1 system-ui,sans-serif",
        "max-width:calc(100vw - 32px)", "overflow-x:auto"
    ].join(";");
    pages.forEach(([href, label]) => {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = label;
        const active = href === here;
        a.style.cssText = [
            "padding:7px 10px", "border-radius:4px", "text-decoration:none", "white-space:nowrap",
            "color:" + (active ? "#000" : "#ccc"), "background:" + (active ? "#fff" : "transparent")
        ].join(";");
        bar.appendChild(a);
    });
    document.body.appendChild(bar);
})();
