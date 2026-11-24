// =====================================================================
// HOME — score counter, CONTINUE countdown, stage select (filters + pages),
// boot sequence, hero light cycle duel. Shared behaviour: Core/script.js
// =====================================================================

const scoreEl = document.getElementById("score");
addEventListener("scroll", () => {
    scoreEl.textContent = String(Math.round(scrollY * 7.3)).padStart(6, "0").slice(-6);
}, { passive: true });

let n = 9; const cd = document.getElementById("cd");
setInterval(() => { n = n <= 0 ? 9 : n - 1; cd.textContent = n; }, 1000);

// ---------- STAGE SELECT: filters + pages of 4 + single preview ----------
(function stageSelect() {
    const PAGE_SIZE = 4;
    const list = document.getElementById("list");
    const allRows = [...list.querySelectorAll(".row")];
    const worldBtns = document.querySelectorAll(".worlds button");
    const prevBtn = document.getElementById("prev"), nextBtn = document.getElementById("next");
    const pageLabel = document.getElementById("page-label"), dots = document.getElementById("dots");
    const pvWrap = document.querySelector(".preview");
    const pv = document.getElementById("preview"), pvLabel = document.getElementById("pv-label"), flash = document.getElementById("flash");

    const matches = (row, f) => f === "all" || row.dataset.cat.split(" ").includes(f);
    let visible = allRows, page = 0;
    const pageCount = () => Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
    const currentSlice = () => visible.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    // project count on each filter
    worldBtns.forEach(b => {
        const sup = document.createElement("sup");
        sup.textContent = String(allRows.filter(r => matches(r, b.dataset.f)).length).padStart(2, "0");
        b.appendChild(sup);
    });

    function updateLabel(row) {
        pvLabel.textContent = row.querySelector(".n").textContent + " // " + row.querySelector("h4").textContent.toUpperCase();
    }

    function activate(row, withFlash = true) {
        if (!row || row.classList.contains("on")) { if (row) updateLabel(row); return; }
        allRows.forEach(r => r.classList.remove("on"));
        row.classList.add("on");
        updateLabel(row);
        if (pvWrap.offsetParent === null) return;   // preview hidden (mobile): don't load videos
        pv.poster = row.dataset.poster;
        pv.src = row.dataset.video;
        pv.play().catch(() => {});
        if (withFlash) { flash.classList.remove("go"); void flash.offsetWidth; flash.classList.add("go"); }
    }

    function render(animate = true) {
        const slice = currentSlice();
        allRows.forEach(r => r.classList.add("out"));
        list.querySelectorAll(".slot-empty").forEach(s => s.remove());
        for (let i = slice.length; i < PAGE_SIZE; i++) {   // fill the page so the list never changes height
            const s = document.createElement("div");
            s.className = "slot-empty"; s.setAttribute("aria-hidden", "true");
            s.textContent = "— EMPTY SLOT —";
            list.appendChild(s);
        }
        slice.forEach((r, i) => {
            r.classList.remove("out");
            r.querySelector(".n").textContent = `STAGE ${page + 1}-${i + 1}`;
            if (animate) { r.classList.remove("enter"); void r.offsetWidth; r.style.animationDelay = i * 60 + "ms"; r.classList.add("enter"); }
        });
        const n = pageCount();
        pageLabel.textContent = `WORLD ${page + 1}/${n}`;
        dots.innerHTML = "";
        for (let i = 0; i < n; i++) { const d = document.createElement("i"); if (i === page) d.className = "on"; dots.appendChild(d); }
        prevBtn.disabled = nextBtn.disabled = n < 2;
        const on = slice.find(r => r.classList.contains("on"));
        activate(on || slice[0], !on);
    }

    // pages cycle (wrap around)
    function goPage(delta) { const n = pageCount(); page = (page + delta + n) % n; render(); }
    prevBtn.addEventListener("click", () => goPage(-1));
    nextBtn.addEventListener("click", () => goPage(1));

    worldBtns.forEach(b => b.addEventListener("click", () => {
        worldBtns.forEach(x => x.classList.toggle("on", x === b));
        visible = allRows.filter(r => matches(r, b.dataset.f));
        page = 0;
        render();
    }));

    allRows.forEach(row => {
        row.addEventListener("mouseenter", () => activate(row));
        row.addEventListener("focus", () => activate(row));
    });

    // keyboard: up/down select, left/right change world, enter follows the link
    list.addEventListener("keydown", e => {
        const slice = currentSlice(), i = slice.indexOf(document.activeElement);
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const j = (i + (e.key === "ArrowDown" ? 1 : -1) + slice.length) % slice.length;
            slice[j].focus();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            goPage(e.key === "ArrowRight" ? 1 : -1);
            currentSlice()[0].focus();
        }
    });

    render(false);
})();

// ---------- BOOT SEQUENCE ----------
(function boot() {
    const root = document.documentElement;
    if (!root.classList.contains("booting")) return;
    const el = document.getElementById("boot"), log = document.getElementById("boot-log"), fill = document.getElementById("boot-fill");
    const projects = document.querySelectorAll("#list .row").length;
    const lines = [
        ["VS-OS BIOS v2.6 (C) 2026 V.SINGIER", "", "dim"],
        ["", ""],
        ["CPU", "x86-64 OK"],
        ["MEMORY CHECK", "640K OK"],
        ["LOADING KERNEL", "OK"],
        ["MOUNT /ENGINE", "OK"],
        ["  > RENDER [DX12]", "OK"],
        ["  > MATH [CUSTOM]", "OK"],
        ["  > PHYSICS", "WIP", "wip"],
        ["  > ECS", "WIP", "wip"],
        ["MOUNT /PROJECTS", String(projects).padStart(2, "0") + " FOUND", "hi"],
        ["SCANNING USER", "GUEST", "hi"],
        ["", ""],
        ["ENTERING THE GRID", "", "end"],
    ];
    let done = false;
    const timers = [];
    const wait = ms => new Promise(r => timers.push(setTimeout(r, ms)));

    function finish() {
        if (done) return;
        done = true;
        timers.forEach(clearTimeout);
        fill.style.width = "100%";
        try { sessionStorage.setItem("vs-booted", "1"); } catch (e) {}
        el.classList.add("out");
        root.classList.add("boot-done");
        setTimeout(() => { root.classList.remove("booting"); el.remove(); }, 950);
    }

    async function run() {
        await wait(850);                      // CRT power-on
        for (let i = 0; i < lines.length && !done; i++) {
            const [label, status, cls] = lines[i];
            const line = document.createElement("div");
            if (cls === "dim") line.className = "dim";
            log.appendChild(line);
            for (let c = 0; c < label.length && !done; c += 3) {   // type the label
                line.textContent = label.slice(0, c + 3);
                await wait(10);
            }
            if (done) return;
            if (status) {
                line.textContent = label.padEnd(26, " ").replace(/ +$/, m => " " + ".".repeat(Math.max(2, m.length - 1)) + " ");
                await wait(70 + Math.random() * 110);
                const s = document.createElement("span");
                s.className = cls || "ok";
                s.textContent = status;
                line.appendChild(s);
            }
            if (cls === "end") {
                line.className = "hi";
                const caret = document.createElement("span");
                caret.className = "caret"; caret.textContent = "_";
                line.appendChild(caret);
            }
            fill.style.width = Math.round((i + 1) / lines.length * 100) + "%";
            await wait(40);
        }
        await wait(550);
        finish();
    }

    ["click", "keydown", "touchstart"].forEach(ev => addEventListener(ev, finish, { once: true }));
    run();
})();

// ---------- HERO LIGHT CYCLE DUEL ----------
// The "survivor" lays a wall, the "crasher" rides into it and derezzes; colours swap every round.
(function heroCycles() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hero = document.querySelector(".hero"), svg = hero.querySelector(".trails");
    const VB_W = 1200, VB_H = 800, SPEED = 420;          // speed in viewBox units per second
    const riders = [...svg.querySelectorAll("path")].map(path => {
        const bike = document.createElement("span");
        bike.className = "bike"; bike.setAttribute("aria-hidden", "true");
        hero.appendChild(bike);
        const len = path.getTotalLength();
        path.style.strokeDasharray = len;
        return { path, bike, len, crasher: path.dataset.role === "crasher", delay: path.dataset.role === "crasher" ? .6 : 0, done: false };
    });
    // big crash: flash, two shockwaves, flying shards, screen shake
    function explode(x, y, colour) {
        const boom = document.createElement("div");
        boom.className = "boom"; boom.setAttribute("aria-hidden", "true");
        boom.style.transform = `translate(${x}px, ${y}px)`;
        boom.style.setProperty("--p", colour);
        let html = '<i class="flash"></i><i class="ring"></i><i class="ring r2"></i>';
        for (let i = 0; i < 22; i++) {
            const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 140;
            html += `<i class="shard${i % 3 === 0 ? " w" : ""}" style="--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d * .7}px;--rot:${Math.random() * 360 - 180}deg;animation-duration:${.6 + Math.random() * .5}s"></i>`;
        }
        boom.innerHTML = html;
        hero.appendChild(boom);
        hero.classList.remove("shake"); void hero.offsetWidth; hero.classList.add("shake");
        setTimeout(() => boom.remove(), 1300);
    }

    const roundEnd = Math.max(...riders.map(r => r.delay + r.len / SPEED)) + 1.2;   // hold the walls a moment
    let round = 0, t0 = null, fading = false;

    function setColours() {
        const swap = round % 2 === 1;
        riders.forEach(r => {
            const blue = r.crasher !== swap;
            r.path.setAttribute("class", blue ? "tb" : "to");
            r.bike.dataset.c = blue ? "b" : "o";
        });
    }

    function reset(now) {
        t0 = now; fading = false;
        riders.forEach(r => {
            r.done = false;
            r.path.classList.remove("fade", "dead", "hit");
            r.path.style.strokeDashoffset = r.len;
            r.bike.className = "bike";
        });
        setColours();
    }

    // viewBox point -> hero pixels (preserveAspectRatio="none", maybe mirrored for team orange)
    function toPx(pt, flip) {
        const x = flip ? VB_W - pt.x : pt.x;
        return [x / VB_W * hero.clientWidth, pt.y / VB_H * hero.clientHeight];
    }

    function place(r, s, flip) {
        const p = r.path.getPointAtLength(s), q = r.path.getPointAtLength(Math.max(0, s - 3));
        const [x, y] = toPx(p, flip), [qx, qy] = toPx(q, flip);
        const ang = Math.atan2(y - qy, x - qx) * 180 / Math.PI;
        r.bike.style.transform = `translate(${x}px, ${y}px) translate(-100%, -50%) rotate(${ang}deg)`;
        r.bike.style.transformOrigin = "100% 50%";          // rotate around the nose, which sits on the trail tip
    }

    function frame(now) {
        requestAnimationFrame(frame);
        if (document.documentElement.classList.contains("booting")) return;   // wait for the boot screen
        if (t0 === null) reset(now);
        const t = (now - t0) / 1000;
        const m = getComputedStyle(svg).transform;
        const flip = m !== "none" && new DOMMatrix(m).a < 0;

        riders.forEach(r => {
            const s = Math.min(r.len, Math.max(0, (t - r.delay) * SPEED));
            r.path.style.strokeDashoffset = r.len - s;
            if (r.done) return;
            if (s <= 0) return;
            if (s < r.len) { r.bike.classList.add("on"); place(r, s, flip); return; }
            r.done = true;
            place(r, r.len, flip);
            if (r.crasher) {                                  // hit the wall: explosion + trail collapses
                r.bike.classList.remove("on");
                r.path.classList.add("dead");
                const [bx, by] = toPx(r.path.getPointAtLength(r.len), flip);
                explode(bx, by, r.bike.dataset.c === "o" ? "var(--orange)" : "var(--blue)");
                riders.forEach(o => { if (o !== r) { o.path.classList.remove("hit"); void o.path.getBBox(); o.path.classList.add("hit"); } });
            } else {
                r.bike.classList.remove("on");                // rode off-screen
            }
        });

        if (!fading && t > roundEnd) {
            fading = true;
            riders.forEach(r => r.path.classList.add("fade"));
        }
        if (t > roundEnd + .8) { round++; reset(now); }
    }
    requestAnimationFrame(frame);
})();

