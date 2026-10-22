(function () {
  "use strict";
  const M = window.MODELO;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, attrs = {}, html) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") e.className = v; else if (k === "style") e.style.cssText = v; else e.setAttribute(k, v);
    }
    if (html != null) e.innerHTML = html;
    return e;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const SVGNS = "http://www.w3.org/2000/svg";

  const T = new Map(M.tablas.map((t) => [t.nombre, t]));
  const ORIG = new Map(M.tablas.map((t) => [t.nombre, { x: t.x, y: t.y }]));

  // Preguntas asociadas a cada tabla / campo
  const qByTable = new Map();
  const qByField = new Map();
  M.preguntas.forEach((p) => p.destino.forEach(([t, f]) => {
    if (!qByTable.has(t)) qByTable.set(t, new Set());
    qByTable.get(t).add(p.id);
    const k = t + "." + f;
    if (!qByField.has(k)) qByField.set(k, new Set());
    qByField.get(k).add(p.id);
  }));
  const qList = (t) => [...(qByTable.get(t) || [])].sort((a, b) => +a.slice(1) - +b.slice(1));

  const relsOf = (name) => M.relaciones.filter((r) => r.de[0] === name || r.a[0] === name);
  const neighbours = (name) => new Set(relsOf(name).flatMap((r) => [r.de[0], r.a[0]]));

  const tagsFor = (f) => {
    const out = [];
    if (f.pk) out.push('<span class="tag pk">PK</span>');
    if (f.fk) out.push(`<span class="tag fk">FK → ${esc(f.fk)}</span>`);
    if (f.nn && !f.pk) out.push('<span class="tag">NOT NULL</span>');
    if (f.uq) out.push('<span class="tag">UNIQUE</span>');
    if (f.ai) out.push('<span class="tag">AUTO_INCREMENT</span>');
    if (f.def) out.push(`<span class="tag">DEFAULT ${esc(f.def)}</span>`);
    if (f.chk) out.push(`<span class="tag">CHECK ${esc(f.chk)}</span>`);
    return out.join("");
  };
  const cardTxt = { one: "1", zone: "0..1", many: "1..N", zmany: "0..N" };

  /* ---------------- Diagrama ---------------- */
  const viewport = $("#viewport");
  const world = $("#world");
  const svg = $("#edges");
  const cardEls = new Map();
  const edgeEls = [];

  M.tablas.forEach((t) => {
    const qs = qList(t.nombre);
    const card = el("div", { class: `tbl g-${t.grupo}`, "data-t": t.nombre });
    const head = el("div", { class: "tbl__head" },
      `<span class="swatch"></span><h3 class="tbl__name">${esc(t.nombre)}</h3>` +
      (qs.length ? `<span class="tbl__qs">${qs.length > 3 ? qs.length + " preguntas" : qs.join(" ")}</span>` : ""));
    const ul = el("ul");
    t.fields.forEach((f) => {
      const key = f.pk && f.fk ? "PK FK" : f.pk ? "PK" : f.fk ? "FK" : "";
      const cls = f.pk ? "pk" : f.fk ? "fk" : "";
      const li = el("li", { "data-f": f.n, class: f.nn && !f.pk ? "is-nn" : "", title: f.c || "" },
        `<span class="k ${cls}">${key}</span><span class="fn">${esc(f.n)}</span><span class="ft">${esc(f.t)}</span>`);
      ul.appendChild(li);
    });
    card.append(head, ul);
    world.appendChild(card);
    cardEls.set(t.nombre, card);
  });

  function placeCards() {
    M.tablas.forEach((t) => {
      const c = cardEls.get(t.nombre);
      c.style.left = t.x + "px";
      c.style.top = t.y + "px";
    });
  }

  M.relaciones.forEach((r, i) => {
    const g = document.createElementNS(SVGNS, "g");
    g.setAttribute("class", "edge");
    const title = document.createElementNS(SVGNS, "title");
    title.textContent = `${r.de.join(".")} → ${r.a.join(".")}`;
    const path = document.createElementNS(SVGNS, "path");
    path.setAttribute("class", "line");
    const mk = document.createElementNS(SVGNS, "g");
    g.append(title, path, mk);
    svg.appendChild(g);
    edgeEls.push({ r, g, path, mk, i });
  });

  function box(name) {
    const t = T.get(name), c = cardEls.get(name);
    return { x: t.x, y: t.y, w: c.offsetWidth, h: c.offsetHeight };
  }
  function rowY(name, field) {
    const c = cardEls.get(name);
    const li = c.querySelector(`li[data-f="${field}"]`);
    return T.get(name).y + li.offsetTop + li.offsetHeight / 2;
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function anchors(r) {
    const A = box(r.de[0]), B = box(r.a[0]);
    const ya = rowY(r.de[0], r.de[1]), yb = rowY(r.a[0], r.a[1]);
    const GAP = 40;
    if (A.x + A.w + GAP <= B.x) return [[A.x + A.w, ya], [1, 0], [B.x, yb], [-1, 0]];
    if (B.x + B.w + GAP <= A.x) return [[A.x, ya], [-1, 0], [B.x + B.w, yb], [1, 0]];
    const xa = clamp(B.x + B.w / 2, A.x + 24, A.x + A.w - 24);
    const xb = clamp(A.x + A.w / 2, B.x + 24, B.x + B.w - 24);
    if (A.y + A.h + 20 <= B.y) return [[xa, A.y + A.h], [0, 1], [xb, B.y], [0, -1]];
    if (B.y + B.h + 20 <= A.y) return [[xa, A.y], [0, -1], [xb, B.y + B.h], [0, 1]];
    // superpuestas: rodear por la izquierda
    return [[A.x, ya], [-1, 0], [B.x, yb], [-1, 0]];
  }

  const STUB = 24;
  function marker(p, d, kind) {
    // p: punto sobre el borde de la tabla, d: dirección hacia afuera
    const n = [-d[1], d[0]];
    const at = (k, s) => [p[0] + d[0] * k + n[0] * s, p[1] + d[1] * k + n[1] * s];
    const line = (a, b) => `<path class="mk" d="M${a[0]},${a[1]}L${b[0]},${b[1]}"/>`;
    let s = "";
    const bar = (k) => line(at(k, -6), at(k, 6));
    const circle = (k) => { const c = at(k, 0); return `<circle class="mk-c" cx="${c[0]}" cy="${c[1]}" r="4"/>`; };
    const crow = () => line(at(12, 0), at(0, -7)) + line(at(12, 0), at(0, 7)) + line(at(12, 0), at(0, 0));
    if (kind === "one") s = bar(8) + bar(14);
    else if (kind === "zone") s = bar(8) + circle(18);
    else if (kind === "many") s = crow() + bar(17);
    else if (kind === "zmany") s = crow() + circle(19);
    return s;
  }

  function drawEdges() {
    edgeEls.forEach((e) => {
      const [p1, d1, p2, d2] = anchors(e.r);
      const s1 = [p1[0] + d1[0] * STUB, p1[1] + d1[1] * STUB];
      const s2 = [p2[0] + d2[0] * STUB, p2[1] + d2[1] * STUB];
      const dist = Math.hypot(s2[0] - s1[0], s2[1] - s1[1]);
      const k = Math.max(30, dist * 0.4);
      const c1 = [s1[0] + d1[0] * k, s1[1] + d1[1] * k];
      const c2 = [s2[0] + d2[0] * k, s2[1] + d2[1] * k];
      e.path.setAttribute("d", `M${p1}L${s1}C${c1} ${c2} ${s2}L${p2}`);
      e.mk.innerHTML = marker(p1, d1, e.r.cardDe) + marker(p2, d2, e.r.cardA);
    });
  }

  /* ---- Cámara ---- */
  const cam = { x: 0, y: 0, k: 1 };
  const zoomVal = $("#zoom-valor");
  function applyCam() {
    world.style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.k})`;
    viewport.style.backgroundPosition = `${cam.x}px ${cam.y}px`;
    viewport.style.backgroundSize = `${22 * cam.k}px ${22 * cam.k}px`;
    zoomVal.textContent = Math.round(cam.k * 100) + "%";
  }
  function zoomAt(px, py, factor) {
    const k = clamp(cam.k * factor, 0.2, 2.5);
    const f = k / cam.k;
    cam.x = px - (px - cam.x) * f;
    cam.y = py - (py - cam.y) * f;
    cam.k = k;
    applyCam();
  }
  function bounds(names) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    names.forEach((n) => { const b = box(n); x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h); });
    return { x0, y0, x1, y1 };
  }
  function fit(names = [...T.keys()], maxK = 1.1) {
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    if (!vw || !vh) return;
    const b = bounds(names);
    const pad = 48;
    const k = clamp(Math.min((vw - pad * 2) / (b.x1 - b.x0), (vh - pad * 2) / (b.y1 - b.y0)), 0.2, maxK);
    cam.k = k;
    cam.x = (vw - (b.x1 - b.x0) * k) / 2 - b.x0 * k;
    cam.y = (vh - (b.y1 - b.y0) * k) / 2 - b.y0 * k;
    applyCam();
  }
  function focusTable(name) {
    fit([name, ...neighbours(name)], 1);
  }

  $("#zoom-mas").addEventListener("click", () => zoomAt(viewport.clientWidth / 2, viewport.clientHeight / 2, 1.2));
  $("#zoom-menos").addEventListener("click", () => zoomAt(viewport.clientWidth / 2, viewport.clientHeight / 2, 1 / 1.2));
  $("#ajustar").addEventListener("click", () => fit());
  $("#reordenar").addEventListener("click", () => {
    M.tablas.forEach((t) => Object.assign(t, ORIG.get(t.nombre)));
    placeCards(); drawEdges(); fit();
  });
  viewport.addEventListener("wheel", (e) => {
    e.preventDefault();
    const r = viewport.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0015));
  }, { passive: false });

  /* ---- Arrastre: fondo (paneo), encabezado (mover tabla), pellizco (zoom) ---- */
  const pointers = new Map();
  let drag = null; // {type:'pan'|'table', ...}
  let pinch = null;

  viewport.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    viewport.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: cam.k };
      drag = null;
      return;
    }
    const card = e.target.closest(".tbl");
    const onHead = e.target.closest(".tbl__head");
    drag = {
      sx: e.clientX, sy: e.clientY, moved: false, card,
      type: onHead ? "table" : "pan",
      cx: cam.x, cy: cam.y,
      tx: card ? T.get(card.dataset.t).x : 0, ty: card ? T.get(card.dataset.t).y : 0
    };
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const r = viewport.getBoundingClientRect();
      zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, (pinch.k * d / pinch.d) / cam.k);
      return;
    }
    if (!drag) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    if (drag.type === "pan") {
      viewport.classList.add("is-panning");
      cam.x = drag.cx + dx; cam.y = drag.cy + dy; applyCam();
    } else {
      const t = T.get(drag.card.dataset.t);
      t.x = Math.round(drag.tx + dx / cam.k); t.y = Math.round(drag.ty + dy / cam.k);
      drag.card.classList.add("is-drag");
      drag.card.style.left = t.x + "px"; drag.card.style.top = t.y + "px";
      drawEdges();
    }
  });
  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (!drag) return;
    viewport.classList.remove("is-panning");
    if (drag.card) drag.card.classList.remove("is-drag");
    if (!drag.moved && e.type === "pointerup") {
      if (drag.card) select(drag.card.dataset.t); else clearSelection();
    }
    drag = null;
  }
  viewport.addEventListener("pointerup", endPointer);
  viewport.addEventListener("pointercancel", endPointer);

  /* ---- Resaltado ---- */
  let selected = null;
  let activeQ = null;
  let hoverName = null;

  function paint() {
    const focus = selected || (activeQ ? null : hoverName);
    const qFields = new Set();
    const qTables = new Set();
    if (activeQ) {
      const p = M.preguntas.find((q) => q.id === activeQ);
      p.destino.forEach(([t, f]) => { qTables.add(t); qFields.add(t + "." + f); });
    }
    const near = focus ? neighbours(focus) : null;
    cardEls.forEach((c, name) => {
      c.classList.toggle("is-sel", name === selected);
      let dim = false, rel = false;
      if (focus) { rel = near.has(name) && name !== focus; dim = !near.has(name) && name !== focus; }
      else if (activeQ) { rel = qTables.has(name); dim = !rel; }
      c.classList.toggle("is-rel", rel);
      c.classList.toggle("is-dim", dim);
      c.querySelectorAll("li").forEach((li) => li.classList.toggle("is-q", qFields.has(name + "." + li.dataset.f)));
    });
    edgeEls.forEach((e) => {
      let on = false, dim = false;
      if (focus) { on = e.r.de[0] === focus || e.r.a[0] === focus; dim = !on; }
      else if (activeQ) { on = qTables.has(e.r.de[0]) && qTables.has(e.r.a[0]); dim = !on; }
      e.g.classList.toggle("is-on", on);
      e.g.classList.toggle("is-dim", dim);
    });
  }

  cardEls.forEach((c, name) => {
    c.addEventListener("pointerenter", () => { if (!drag) { hoverName = name; paint(); } });
    c.addEventListener("pointerleave", () => { hoverName = null; paint(); });
  });

  /* ---- Panel de detalle ---- */
  const panel = $("#panel"), panelBody = $("#panel-body");
  function select(name) {
    selected = name;
    const t = T.get(name), g = M.grupos[t.grupo];
    const qs = qList(name);
    const rels = relsOf(name).map((r) => {
      const other = r.de[0] === name ? r.a[0] : r.de[0];
      const mine = r.de[0] === name ? r.cardDe : r.cardA;
      const theirs = r.de[0] === name ? r.cardA : r.cardDe;
      return `<li><button data-go="${esc(other)}">
        <code>${esc(r.de.join("."))} → ${esc(r.a.join("."))}</code>
        <span class="card"> ${cardTxt[theirs]} : ${cardTxt[mine]}</span><br>${esc(r.texto)}</button></li>`;
    }).join("");
    panelBody.innerHTML = `
      <span class="grp" style="--gc:var(--g-${t.grupo})"><span class="swatch"></span>${esc(g.nombre)}</span>
      <h2>${esc(name)}</h2>
      <p>${esc(t.desc)}</p>
      ${qs.length ? `<p class="note">Preguntas que guarda: ${qs.map((q) => `<b>${q}</b>`).join(", ")}</p>` : ""}
      <h3>Columnas</h3>
      <table class="fields"><tbody>${t.fields.map((f) => `
        <tr><td>${esc(f.n)}<div class="tags">${tagsFor(f)}${f.q ? `<span class="tag q">${f.q}</span>` : ""}</div>${f.c ? `<div class="c">${esc(f.c)}</div>` : ""}</td>
        <td class="t">${esc(f.t)}</td></tr>`).join("")}</tbody></table>
      <h3>Relaciones</h3>
      <ul class="rels">${rels}</ul>
      ${t.semillas ? `<h3>Valores del catálogo</h3><ol class="seeds">${t.semillas.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>${t.notaSemillas ? `<p class="note">${esc(t.notaSemillas)}</p>` : ""}` : ""}
    `;
    panel.hidden = false;
    panel.scrollTop = 0;
    paint();
  }
  function clearSelection() {
    selected = null; panel.hidden = true; paint();
  }
  $("#cerrar").addEventListener("click", clearSelection);
  panelBody.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (b) { select(b.dataset.go); focusTable(b.dataset.go); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { clearSelection(); setQuestion(null); }
  });

  /* ---- Leyenda ---- */
  const legend = $("#leyenda");
  Object.entries(M.grupos).forEach(([k, g]) => {
    const b = el("button", { class: "legend__item", style: `--gc:var(--g-${k})`, "aria-pressed": "false", title: g.desc },
      `<span class="swatch"></span>${esc(g.nombre)}`);
    b.addEventListener("click", () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      legend.querySelectorAll(".legend__item").forEach((x) => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", String(on));
      selected = null; panel.hidden = true; setQuestion(null);
      cardEls.forEach((c, name) => {
        c.classList.remove("is-rel", "is-sel");
        c.classList.toggle("is-dim", on && T.get(name).grupo !== k);
      });
      edgeEls.forEach((e) => { e.g.classList.remove("is-on"); e.g.classList.toggle("is-dim", on); });
    });
    legend.appendChild(b);
  });

  /* ---- Preguntas ---- */
  const qbar = $("#qbar"), banner = $("#banner");
  qbar.appendChild(el("span", { class: "qbar__label" }, "Pregunta"));
  M.preguntas.forEach((p) => {
    const b = el("button", { class: "qchip", "aria-pressed": "false", "data-q": p.id, title: p.texto }, p.id);
    b.addEventListener("click", () => setQuestion(activeQ === p.id ? null : p.id));
    qbar.appendChild(b);
  });
  function setQuestion(id) {
    activeQ = id;
    qbar.querySelectorAll(".qchip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.q === id)));
    legend.querySelectorAll(".legend__item").forEach((x) => x.setAttribute("aria-pressed", "false"));
    if (id) {
      const p = M.preguntas.find((q) => q.id === id);
      selected = null; panel.hidden = true;
      banner.innerHTML = `<b>${p.id}</b>${esc(p.texto)}<small>${esc(p.tipo)} · se guarda en ${p.destino.map(([t, f]) => `<code>${esc(t)}.${esc(f)}</code>`).join(", ")}</small>`;
      banner.hidden = false;
      fit([...new Set(p.destino.map((d) => d[0]))], 1);
    } else banner.hidden = true;
    paint();
  }

  /* ---- Búsqueda ---- */
  const input = $("#buscar");
  function norm(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  input.addEventListener("input", () => {
    const q = norm(input.value.trim());
    legend.querySelectorAll(".legend__item").forEach((x) => x.setAttribute("aria-pressed", "false"));
    cardEls.forEach((c, name) => {
      let hit = false;
      c.querySelectorAll("li").forEach((li) => {
        const h = q.length > 1 && norm(li.dataset.f).includes(q);
        li.classList.toggle("is-hit", h); hit = hit || h;
      });
      hit = hit || (q.length > 1 && norm(name).includes(q));
      c.classList.toggle("is-dim", q.length > 1 && !hit);
      c.classList.toggle("is-rel", q.length > 1 && hit);
    });
    edgeEls.forEach((e) => e.g.classList.toggle("is-dim", q.length > 1));
    if (q.length <= 1) paint();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const first = [...cardEls.entries()].find(([, c]) => !c.classList.contains("is-dim") && c.classList.contains("is-rel"));
    if (first) { input.blur(); select(first[0]); focusTable(first[0]); }
  });

  /* ---------------- Diccionario ---------------- */
  const dic = $("#diccionario");
  let dhtml = `<p class="doc__intro">Todas las tablas del modelo, agrupadas por función. Las columnas marcadas como <b>PK</b> forman la llave primaria y las <b>FK</b> apuntan a otra tabla. Los catálogos incluyen los valores que se cargan en ellos.</p>`;
  Object.entries(M.grupos).forEach(([k, g]) => {
    const tabs = M.tablas.filter((t) => t.grupo === k);
    dhtml += `<h2 class="group-title" style="--gc:var(--g-${k})"><span class="swatch"></span>${esc(g.nombre)} <small>${tabs.length} ${tabs.length === 1 ? "tabla" : "tablas"} · ${esc(g.desc)}</small></h2><div class="cards">`;
    tabs.forEach((t) => {
      dhtml += `<article class="dcard"><header><h3>${esc(t.nombre)}</h3><button class="link-btn" data-diagram="${esc(t.nombre)}">Ver en el diagrama</button></header>
        <p>${esc(t.desc)}</p>
        <div class="table-wrap"><table class="dtable"><thead><tr><th>Columna</th><th>Tipo</th><th>Restricciones</th></tr></thead><tbody>
        ${t.fields.map((f) => `<tr><td class="mono">${esc(f.n)}</td><td class="mono">${esc(f.t)}</td><td><div class="tags">${tagsFor(f)}${f.q ? `<span class="tag q">${f.q}</span>` : ""}</div>${f.c ? `<div class="note">${esc(f.c)}</div>` : ""}</td></tr>`).join("")}
        </tbody></table></div>
        ${t.semillas ? `<details><summary>Valores del catálogo (${t.semillas.length})</summary><ol class="seeds">${t.semillas.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></details>` : ""}
      </article>`;
    });
    dhtml += `</div>`;
  });
  dhtml += `<section class="rules"><h3>Reglas que se validan al cargar los datos</h3><ol>${M.reglas.map((r) => `<li>${esc(r)}</li>`).join("")}</ol></section>`;
  dic.innerHTML = dhtml;

  /* ---------------- Preguntas ---------------- */
  const pq = $("#preguntas");
  pq.innerHTML = `<p class="doc__intro">Cada pregunta de la encuesta y el lugar exacto donde se guarda su respuesta. Toca una columna para verla en el diagrama.</p>
    <div class="qlist">${M.preguntas.map((p) => `
      <article class="qrow"><span class="qrow__id">${p.id}</span>
        <p class="qrow__text">${esc(p.texto)}</p>
        <span class="qrow__type">${esc(p.tipo)}</span>
        <div class="dest">${p.destino.map(([t, f]) => `<button data-diagram="${esc(t)}" data-q="${p.id}">${esc(t)}.${esc(f)}</button>`).join("")}</div>
      </article>`).join("")}</div>`;

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-diagram]");
    if (!b) return;
    showView("diagrama");
    requestAnimationFrame(() => {
      if (b.dataset.q) setQuestion(b.dataset.q);
      else { setQuestion(null); select(b.dataset.diagram); focusTable(b.dataset.diagram); }
    });
  });

  /* ---------------- Pestañas ---------------- */
  const views = ["diagrama", "diccionario", "preguntas"];
  let fitted = false;
  function showView(v) {
    if (!views.includes(v)) v = "diagrama";
    views.forEach((x) => {
      $("#view-" + x).hidden = x !== v;
      $("#tab-" + x).setAttribute("aria-selected", String(x === v));
    });
    try { history.replaceState(null, "", "#" + v); } catch (_) { /* sin historial */ }
    if (v === "diagrama") requestAnimationFrame(() => { drawEdges(); if (!fitted) { if (viewport.clientWidth < 600) fit(["respuesta"], 0.7); else fit(); fitted = true; } });
  }
  document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));

  /* ---------------- Pantalla completa ---------------- */
  const fsTarget = $("#view-diagrama");
  const fsBtn = $("#pantalla");
  const fsLabel = fsBtn.querySelector("span");
  const nativeEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  const isFull = () => !!nativeEl() || fsTarget.classList.contains("is-max");
  function syncFull() {
    const on = isFull();
    fsBtn.setAttribute("aria-pressed", String(on));
    fsLabel.textContent = on ? "Salir" : "Pantalla completa";
    fsBtn.title = on ? "Salir de pantalla completa (tecla F o Esc)" : "Pantalla completa (tecla F)";
    document.body.classList.toggle("no-scroll", fsTarget.classList.contains("is-max"));
    requestAnimationFrame(() => { drawEdges(); fit(); });
  }
  async function toggleFull() {
    if (isFull()) {
      if (fsTarget.classList.contains("is-max")) fsTarget.classList.remove("is-max");
      else if (document.exitFullscreen) await document.exitFullscreen().catch(() => {});
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      syncFull();
      return;
    }
    if (fsTarget.hidden) showView("diagrama");
    try {
      if (fsTarget.requestFullscreen) await fsTarget.requestFullscreen();
      else if (fsTarget.webkitRequestFullscreen) fsTarget.webkitRequestFullscreen();
      else throw new Error("sin API");
    } catch (_) {
      fsTarget.classList.add("is-max"); // respaldo: ocupa toda la ventana
    }
    syncFull();
  }
  fsBtn.addEventListener("click", toggleFull);
  document.addEventListener("fullscreenchange", syncFull);
  document.addEventListener("webkitfullscreenchange", syncFull);
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "");
    if (!typing && (e.key === "f" || e.key === "F") && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); toggleFull(); }
    if (e.key === "Escape" && fsTarget.classList.contains("is-max")) { fsTarget.classList.remove("is-max"); syncFull(); }
  });

  /* ---------------- Inicio ---------------- */
  placeCards();
  const start = () => {
    drawEdges();
    showView((location.hash || "#diagrama").slice(1));
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
  window.addEventListener("load", drawEdges);
  let rt, lastW = window.innerWidth;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (window.innerWidth !== lastW) { lastW = window.innerWidth; fit(); } }, 150);
  });
})();
