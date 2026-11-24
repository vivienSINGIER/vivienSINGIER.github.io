// Shared behaviour for the G-style project page templates (style-lab, temporary).
// Each page sets html.intro-on / data-team in a tiny inline <head> script before paint.
(function () {
    const root = document.documentElement;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- section titles: light cycle run when they come into view ----------
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add("in")), { threshold: .4 });
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));

    // ---------- stage intro: STAGE x-y / NAME / READY? then digitize out ----------
    (function intro() {
        const el = document.getElementById("stage-intro");
        if (!el || !root.classList.contains("intro-on")) return;
        let done = false;
        const finish = () => {
            if (done) return; done = true;
            try { sessionStorage.setItem("vs-intro-" + location.pathname, "1"); } catch (e) {}
            el.classList.add("out");
            setTimeout(() => { root.classList.remove("intro-on"); el.remove(); }, 720);
        };
        ["click", "keydown", "touchstart"].forEach(ev => addEventListener(ev, finish, { once: true }));
        setTimeout(finish, 1500);
    })();

    // ---------- clip viewer ----------
    document.querySelectorAll("[data-viewer]").forEach(viewer => {
        const video = viewer.querySelector("video");
        const clips = [...viewer.querySelectorAll(".clip")];
        const label = viewer.querySelector("[data-viewer-label]");
        const flash = viewer.querySelector(".flash");
        let i = clips.findIndex(c => c.classList.contains("on"));
        if (i < 0) i = 0;
        function show(n, withFlash = true) {
            i = (n + clips.length) % clips.length;
            const c = clips[i];
            clips.forEach(x => x.classList.toggle("on", x === c));
            video.poster = c.dataset.poster;
            video.src = c.dataset.src;
            video.play().catch(() => {});
            if (label) label.textContent = `REPLAY ${i + 1}/${clips.length} // ${c.dataset.label}`;
            if (flash && withFlash) { flash.classList.remove("go"); void flash.offsetWidth; flash.classList.add("go"); }
        }
        clips.forEach((c, n) => c.addEventListener("click", () => show(n)));
        viewer.querySelector(".nav-arrow.prev")?.addEventListener("click", () => show(i - 1));
        viewer.querySelector(".nav-arrow.next")?.addEventListener("click", () => show(i + 1));
        viewer.addEventListener("keydown", e => {
            if (e.key === "ArrowRight") { e.preventDefault(); show(i + 1); }
            if (e.key === "ArrowLeft") { e.preventDefault(); show(i - 1); }
        });
        show(i, false);
    });

    // ---------- hover-to-play videos ----------
    document.querySelectorAll("[data-hover-video]").forEach(card => {
        const v = card.querySelector("video");
        if (!v) return;
        card.addEventListener("mouseenter", () => v.play().catch(() => {}));
        card.addEventListener("mouseleave", () => { v.pause(); v.currentTime = 0; });
    });

    // ---------- toast / level up / team ----------
    const toastEl = document.getElementById("toast");
    function toast(text) {
        if (!toastEl) return;
        toastEl.textContent = text;
        toastEl.classList.remove("show"); void toastEl.offsetWidth; toastEl.classList.add("show");
    }
    document.getElementById("levelup")?.addEventListener("click", () => {
        toast("LEVEL UP!");
        scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
    document.getElementById("reboot")?.addEventListener("click", () => {
        try { sessionStorage.removeItem("vs-intro-" + location.pathname); } catch (e) {}
        location.href = location.pathname + "?intro";
    });
    function applyTeam(team) {
        if (team === "orange") root.dataset.team = "orange"; else delete root.dataset.team;
        try { localStorage.setItem("vs-team", team); } catch (e) {}
    }
    document.querySelectorAll("[data-team-toggle]").forEach(btn => btn.addEventListener("click", () => {
        const next = root.dataset.team === "orange" ? "blue" : "orange";
        const label = next === "orange" ? "TEAM ORANGE" : "TEAM BLUE";
        if (reduceMotion) { applyTeam(next); toast(label); return; }
        if (document.getElementById("wipe")) return;
        const wipe = document.createElement("div");
        wipe.id = "wipe";
        wipe.innerHTML = '<div class="panel"></div><div class="laser"></div>';
        document.body.appendChild(wipe);
        setTimeout(() => { applyTeam(next); toast(label); }, 350);
        setTimeout(() => wipe.remove(), 720);
    }));

    // ---------- dimmed background light cycles in every .section ----------
    if (reduceMotion) return;
    const CELL = 44, SPEED = 150, MAX_TRAIL = 28, CARELESS = .12;
    const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

    class Arena {
        constructor(section) {
            this.cv = document.createElement("canvas");
            this.cv.className = "bg-cycles"; this.cv.setAttribute("aria-hidden", "true");
            section.prepend(this.cv);
            this.ctx = this.cv.getContext("2d");
            this.bikes = [0, 1].map(team => ({ team, alive: false, cells: [], dir: 0, prog: 0, fade: 0, wait: team * 1.5 + Math.random() }));
            this.sparks = [];
            this.visible = false;
            this.resize();
            new ResizeObserver(() => this.resize()).observe(section);
            new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }).observe(section);
        }
        resize() {
            const dpr = Math.min(devicePixelRatio || 1, 2), r = this.cv.getBoundingClientRect();
            this.w = r.width; this.h = r.height;
            this.cv.width = Math.round(this.w * dpr); this.cv.height = Math.round(this.h * dpr);
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            this.cols = Math.floor(this.w / CELL); this.rows = Math.floor(this.h / CELL);
            this.ox = (this.w - this.cols * CELL) / 2; this.oy = (this.h - this.rows * CELL) / 2;
        }
        px(c) { return [this.ox + c[0] * CELL, this.oy + c[1] * CELL]; }
        inside(c) { return c[0] >= 0 && c[1] >= 0 && c[0] <= this.cols && c[1] <= this.rows; }
        taken(c) { return this.bikes.some(b => b.fade > .3 && b.cells.some(k => k[0] === c[0] && k[1] === c[1])); }
        free(c) { return this.inside(c) && !this.taken(c); }
        spawn(b) {
            const side = Math.floor(Math.random() * 4);
            const rnd = n => 1 + Math.floor(Math.random() * Math.max(1, n - 1));
            const start = [[0, rnd(this.rows)], [rnd(this.cols), 0], [this.cols, rnd(this.rows)], [rnd(this.cols), this.rows]][side];
            if (this.taken(start)) { b.wait = .5; return; }
            Object.assign(b, { alive: true, cells: [start], dir: side, prog: 0, fade: 1 });
        }
        crash(b) {
            b.alive = false;
            const [x, y] = this.px(b.cells[b.cells.length - 1]);
            for (let i = 0; i < 16; i++) {
                const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 120;
                this.sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, team: b.team, ring: false });
            }
            this.sparks.push({ x, y, r: 4, life: 1, team: b.team, ring: true });
        }
        steer(b) {
            const head = b.cells[b.cells.length - 1];
            const next = d => [head[0] + DIRS[d][0], head[1] + DIRS[d][1]];
            const straight = b.dir, turns = Math.random() < .5 ? [(b.dir + 1) % 4, (b.dir + 3) % 4] : [(b.dir + 3) % 4, (b.dir + 1) % 4];
            if (Math.random() < CARELESS) { if (!this.free(next(straight))) this.crash(b); return; }
            if (this.free(next(straight)) && Math.random() < .78) return;
            const ok = turns.find(d => this.free(next(d)));
            if (ok !== undefined) b.dir = ok;
            else if (!this.free(next(straight))) this.crash(b);
        }
        update(dt) {
            this.bikes.forEach(b => {
                if (b.alive) {
                    b.prog += SPEED * dt / CELL;
                    while (b.prog >= 1 && b.alive) {
                        b.prog -= 1;
                        const h = b.cells[b.cells.length - 1];
                        b.cells.push([h[0] + DIRS[b.dir][0], h[1] + DIRS[b.dir][1]]);
                        if (b.cells.length > MAX_TRAIL) b.cells.shift();
                        this.steer(b);
                    }
                } else if (b.fade > 0) {
                    b.fade -= dt * 1.1;
                    if (b.fade <= 0) { b.cells = []; b.wait = 1 + Math.random() * 2.5; }
                } else if ((b.wait -= dt) <= 0) this.spawn(b);
            });
            this.sparks.forEach(s => {
                s.life -= dt * 1.4;
                if (s.ring) s.r += dt * 160; else { s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= .96; s.vy *= .96; }
            });
            this.sparks = this.sparks.filter(s => s.life > 0);
        }
        draw(colours) {
            const g = this.ctx;
            g.clearRect(0, 0, this.w, this.h);
            g.lineJoin = "miter"; g.lineCap = "square";
            this.bikes.forEach(b => {
                if (!b.cells.length) return;
                g.beginPath();
                b.cells.forEach((c, i) => { const [x, y] = this.px(c); i ? g.lineTo(x, y) : g.moveTo(x, y); });
                let hx, hy;
                const last = this.px(b.cells[b.cells.length - 1]);
                if (b.alive) { hx = last[0] + DIRS[b.dir][0] * b.prog * CELL; hy = last[1] + DIRS[b.dir][1] * b.prog * CELL; g.lineTo(hx, hy); }
                g.strokeStyle = colours[b.team];
                g.globalAlpha = .22 * b.fade; g.lineWidth = 7; g.stroke();
                g.globalAlpha = b.fade; g.lineWidth = 2; g.stroke();
                if (b.alive) {
                    g.globalAlpha = 1; g.fillStyle = "#fff";
                    const horiz = DIRS[b.dir][0] !== 0;
                    g.fillRect(hx - (horiz ? 7 : 2.5) - DIRS[b.dir][0] * 5, hy - (horiz ? 2.5 : 7) - DIRS[b.dir][1] * 5, horiz ? 14 : 5, horiz ? 5 : 14);
                }
            });
            this.sparks.forEach(s => {
                g.globalAlpha = Math.max(0, s.life);
                if (s.ring) { g.strokeStyle = colours[s.team]; g.lineWidth = 2; g.beginPath(); g.arc(s.x, s.y, s.r, 0, Math.PI * 2); g.stroke(); }
                else { g.fillStyle = Math.random() < .3 ? "#fff" : colours[s.team]; g.fillRect(s.x - 1.5, s.y - 1.5, 3, 3); }
            });
            g.globalAlpha = 1;
        }
    }
    const arenas = [...document.querySelectorAll(".section")].map(s => new Arena(s));
    let last = performance.now();
    function loop(now) {
        requestAnimationFrame(loop);
        const dt = Math.min(.05, (now - last) / 1000); last = now;
        if (root.classList.contains("intro-on")) return;
        const st = getComputedStyle(root), colours = [st.getPropertyValue("--blue").trim(), st.getPropertyValue("--orange").trim()];
        arenas.forEach(a => { if (a.visible) { a.update(dt); a.draw(colours); } });
    }
    requestAnimationFrame(loop);
})();
