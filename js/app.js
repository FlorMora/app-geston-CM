/* ==========================================================
   Atelier — app de gestión para Community Manager freelance
   La MARCA es la unidad central. Datos en localStorage.
   ========================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "atelier.cm.v1";

  /* ---------- Definiciones ---------- */

  const STATES = [
    { id: "idea",      label: "Idea" },
    { id: "borrador",  label: "Borrador" },
    { id: "enviado",   label: "Enviado al cliente" },
    { id: "aprobado",  label: "Aprobado" },
    { id: "publicado", label: "Publicado" },
  ];
  const STATE_LABEL = Object.fromEntries(STATES.map(s => [s.id, s.label]));
  const STATE_ORDER = STATES.map(s => s.id);

  const FORMATS = [
    { id: "reel",     label: "Reel" },
    { id: "carrusel", label: "Carrusel" },
    { id: "historia", label: "Historia" },
    { id: "post",     label: "Post estático" },
  ];
  const FORMAT_LABEL = Object.fromEntries(FORMATS.map(f => [f.id, f.label]));

  const SEED_BRANDS = [
    {
      id: "jasmin",
      name: "Jasmin Rivas",
      color: "#C06A5B",
      descriptor: "Podóloga",
      objective: "Conversión a turnos",
      pillars: ["Educación", "Casos y resultados", "Turnos y promoción", "Confianza"],
    },
    {
      id: "alquimia",
      name: "Alquimia Kinesio",
      color: "#7D8E6E",
      descriptor: "Ortopedia · plantillas ortopédicas",
      objective: "Educar + turnos",
      pillars: ["Educación", "Producto", "Testimonios", "Turnos"],
    },
    {
      id: "linax",
      name: "Linax",
      color: "#4E7B9E",
      descriptor: "Suplementos naturales · web y Mercado Libre · foco Facebook",
      objective: "Funnel Atraer–Nutrir–Convertir",
      pillars: ["Atraer", "Nutrir", "Convertir"],
    },
    {
      id: "seissiete",
      name: "Seis Siete Va",
      color: "#8A64A8",
      descriptor: "Academia de danza",
      objective: "Comunidad + inscripciones",
      pillars: ["Comunidad", "Clases", "Inscripciones", "Detrás de escena"],
    },
    {
      id: "docta",
      name: "Docta Fragancias",
      color: "#A9822F",
      descriptor: "Perfumes árabes · público masculino",
      objective: "Ventas",
      pillars: ["Producto", "Deseo y lifestyle", "Prueba social", "Ofertas"],
    },
  ];

  /* ---------- Utilidades de fecha ---------- */

  function todayISO() {
    const d = new Date();
    return toISO(d);
  }
  function toISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  function parseISO(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function addDays(iso, n) {
    const d = parseISO(iso);
    d.setDate(d.getDate() + n);
    return toISO(d);
  }
  function mondayOfWeek(iso) {
    const d = parseISO(iso);
    const dow = (d.getDay() + 6) % 7; // lunes = 0
    d.setDate(d.getDate() - dow);
    return toISO(d);
  }
  function fmtShort(iso) {
    const d = parseISO(iso);
    return d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
  }
  function fmtLong(iso) {
    const d = parseISO(iso);
    return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  }
  function daysBetween(fromISO, toISOv) {
    return Math.round((parseISO(toISOv) - parseISO(fromISO)) / 86400000);
  }

  /* ---------- Datos de ejemplo (primera vez) ---------- */

  function seedContents() {
    const t = todayISO();
    let n = 0;
    const mk = (brandId, offset, format, pillar, title, state, copy) => ({
      id: "seed-" + (++n),
      brandId,
      date: addDays(t, offset),
      format,
      pillar,
      title,
      state,
      copy: copy || "",
      notes: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return [
      mk("jasmin", -1, "reel", "Educación", "Uñas encarnadas: cuándo consultar", "enviado",
        "¿Te duele al caminar? Estas son las 3 señales de que esa uña necesita atención profesional…"),
      mk("jasmin", 1, "historia", "Turnos y promoción", "Recordatorio de turnos disponibles", "borrador",
        "Quedan pocos turnos esta semana. Escribinos por WhatsApp y reservá el tuyo."),
      mk("alquimia", 0, "carrusel", "Educación", "¿Qué es el estudio de la pisada?", "aprobado",
        "Paso a paso: así evaluamos tu pisada antes de diseñar tus plantillas personalizadas."),
      mk("alquimia", 3, "post", "Testimonios", "Testimonio: volvió a correr sin dolor", "idea"),
      mk("linax", 0, "post", "Convertir", "Promo Mercado Libre: envío gratis", "enviado",
        "Solo por esta semana: envío gratis en toda la línea de magnesio. Link en la bio."),
      mk("linax", 2, "carrusel", "Nutrir", "5 señales de que te falta magnesio", "borrador"),
      mk("seissiete", -2, "reel", "Comunidad", "Resumen de la clase abierta", "aprobado",
        "Lo que se vivió en la clase abierta del sábado. ¡Gracias a todos los que vinieron!"),
      mk("seissiete", 4, "historia", "Inscripciones", "Últimos lugares comisión martes", "idea"),
      mk("docta", 1, "reel", "Deseo y lifestyle", "Amber Oud: la reseña en 30 segundos", "borrador",
        "Notas de salida, corazón y fondo. Para el que quiere dejar huella sin decir una palabra."),
      mk("docta", -3, "post", "Ofertas", "Combo x2 lanzamiento", "publicado",
        "Llevate dos fragancias árabes premium a precio de lanzamiento."),
    ];
  }

  /* ---------- Estado de la app ---------- */

  let db = load();
  let ui = {
    brand: "all",          // marca seleccionada ("all" = todas)
    view: "panel",         // panel | contenido
    filterState: "all",    // filtro en vista contenido
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.brands) && Array.isArray(data.contents)) return data;
      }
    } catch (e) { /* datos corruptos: se re-inicializa */ }
    const fresh = { brands: SEED_BRANDS, contents: seedContents() };
    persist(fresh);
    return fresh;
  }

  function persist(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data || db));
  }

  function brandById(id) {
    return db.brands.find(b => b.id === id);
  }

  function uid() {
    return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---------- Helpers de renderizado ---------- */

  const $ = sel => document.querySelector(sel);

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function stateBadge(stateId) {
    return `<span class="state-badge state-${stateId}">${esc(STATE_LABEL[stateId])}</span>`;
  }

  function nextState(stateId) {
    const i = STATE_ORDER.indexOf(stateId);
    return i >= 0 && i < STATE_ORDER.length - 1 ? STATE_ORDER[i + 1] : null;
  }

  function visibleContents() {
    return ui.brand === "all"
      ? db.contents
      : db.contents.filter(c => c.brandId === ui.brand);
  }

  function isOverdue(c) {
    return c.state !== "publicado" && c.date && c.date < todayISO();
  }

  /* ---------- Selector de marca ---------- */

  function renderBrandSelector() {
    const el = $("#brandSelector");
    const chips = [
      { id: "all", name: "Todas las marcas", color: "" },
      ...db.brands,
    ];
    el.innerHTML = chips.map(b => `
      <button class="brand-chip ${ui.brand === b.id ? "active" : ""}" data-brand="${b.id}"
        ${b.color ? `style="--chip-color:${b.color}"` : ""}>
        ${b.color ? '<span class="dot"></span>' : ""}
        ${esc(b.name)}
      </button>`).join("");
    el.querySelectorAll(".brand-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        ui.brand = btn.dataset.brand;
        render();
      });
    });
  }

  /* ---------- Panel ---------- */

  function renderPanel() {
    const t = todayISO();
    const contents = visibleContents();
    const brandName = ui.brand === "all" ? null : brandById(ui.brand)?.name;

    // Tareas de hoy
    const overdue = contents.filter(isOverdue)
      .sort((a, b) => a.date.localeCompare(b.date));
    const publishToday = contents.filter(c => c.date === t && c.state === "aprobado");
    const prepare = contents.filter(c =>
      c.date && c.date >= t && daysBetween(t, c.date) <= 2 &&
      (c.state === "idea" || c.state === "borrador"));
    const waiting = contents.filter(c => c.state === "enviado" && !isOverdue(c));

    const hasTasks = overdue.length || publishToday.length || prepare.length || waiting.length;

    const taskItem = c => {
      const b = brandById(c.brandId);
      const next = nextState(c.state);
      return `
      <div class="task-item" style="--item-brand:${b.color}" data-open="${c.id}">
        <span class="task-brandbar"></span>
        <div class="task-body">
          <div class="task-title">${esc(c.title)}</div>
          <div class="task-meta">
            <span class="brand-name">${esc(b.name)}</span>
            <span>·</span><span>${FORMAT_LABEL[c.format]}</span>
            ${c.date ? `<span>·</span><span>${fmtShort(c.date)}</span>` : ""}
            ${stateBadge(c.state)}
          </div>
        </div>
        ${next ? `<button class="advance-btn" data-advance="${c.id}" title="Pasar a ${esc(STATE_LABEL[next])}">
          ${esc(STATE_LABEL[next])}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>` : ""}
      </div>`;
    };

    const group = (label, items, alert) => items.length ? `
      <div class="task-group">
        <div class="task-group-label ${alert ? "alert" : ""}">${label}<span class="count">${items.length}</span></div>
        ${items.map(taskItem).join("")}
      </div>` : "";

    const todayCard = `
      <div class="today-card">
        <div class="today-head">
          <h2>Hoy</h2>
          <span class="today-date">${fmtLong(t)}</span>
        </div>
        ${hasTasks ? `
          ${group("Atrasado", overdue, true)}
          ${group("Publicar hoy", publishToday)}
          ${group("Preparar (próx. 48 h)", prepare)}
          ${group("Esperando al cliente", waiting)}
        ` : `
          <div class="empty-today">
            <div class="serif">Todo al día</div>
            <p>No hay pendientes${brandName ? " para " + esc(brandName) : ""}. Buen momento para adelantar ideas.</p>
          </div>`}
      </div>`;

    // Semana
    const monday = mondayOfWeek(t);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
    const weekHTML = `
      <div class="section">
        <div class="eyebrow">Esta semana</div>
        <div class="week-strip">
          ${weekDays.map(d => {
            const items = contents.filter(c => c.date === d);
            const dd = parseISO(d);
            return `
            <div class="week-day ${d === t ? "today" : ""}" data-day="${d}" title="${fmtLong(d)}">
              <div class="dow">${dd.toLocaleDateString("es-AR", { weekday: "short" }).slice(0, 2)}</div>
              <div class="dnum">${dd.getDate()}</div>
              <div class="week-dots">
                ${items.slice(0, 6).map(c => {
                  const b = brandById(c.brandId);
                  return `<span class="dot ${c.state === "publicado" ? "done" : ""}" style="background:${b.color}; border-color:${b.color}" title="${esc(b.name)}: ${esc(c.title)}"></span>`;
                }).join("")}
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>`;

    // Resumen por marca (solo con "Todas las marcas")
    let brandsHTML = "";
    if (ui.brand === "all") {
      const weekEnd = addDays(monday, 6);
      const summaries = db.brands.map(b => {
        const items = db.contents.filter(c => c.brandId === b.id);
        const week = items.filter(c => c.date && c.date >= monday && c.date <= weekEnd);
        const late = items.filter(isOverdue).length;
        const counts = {};
        STATE_ORDER.forEach(s => { counts[s] = week.filter(c => c.state === s).length; });
        return { b, week, late, counts };
      }).sort((x, y) => y.late - x.late || y.week.length - x.week.length);

      brandsHTML = `
      <div class="section">
        <div class="eyebrow">Marcas</div>
        <div class="brand-summary-list">
          ${summaries.map(({ b, week, late, counts }) => `
            <div class="brand-summary" style="--item-brand:${b.color}" data-gobrand="${b.id}">
              <div class="brand-summary-head">
                <span class="brand-summary-name">${esc(b.name)}</span>
                ${late
                  ? `<span class="late-badge">${late} atrasado${late > 1 ? "s" : ""}</span>`
                  : `<span class="ok-badge">al día</span>`}
              </div>
              <div class="brand-summary-obj">${esc(b.descriptor)} · ${esc(b.objective)}</div>
              <div class="brand-summary-states">
                ${week.length === 0
                  ? `<span class="mini-count" style="color:var(--ink-faint);background:var(--bg-soft)">sin contenido esta semana</span>`
                  : STATES.filter(s => counts[s.id] > 0).map(s =>
                      `<span class="mini-count" style="color:var(--st-${s.id});background:var(--st-${s.id}-bg)">${counts[s.id]} ${esc(s.label.toLowerCase())}</span>`
                    ).join("")}
              </div>
            </div>`).join("")}
        </div>
      </div>`;
    }

    $("#mainView").innerHTML = `
      <h1 class="section-title">${brandName ? esc(brandName) : "Panel general"}</h1>
      <p class="section-sub">${brandName
        ? esc(brandById(ui.brand).descriptor) + " · " + esc(brandById(ui.brand).objective)
        : "Resumen de la semana en todas las marcas"}</p>
      ${todayCard}
      ${weekHTML}
      ${brandsHTML}
    `;

    // interacciones
    bindCommon($("#mainView"));
    $("#mainView").querySelectorAll("[data-gobrand]").forEach(el => {
      el.addEventListener("click", () => {
        ui.brand = el.dataset.gobrand;
        render();
      });
    });
    $("#mainView").querySelectorAll("[data-day]").forEach(el => {
      el.addEventListener("click", () => {
        ui.view = "contenido";
        render();
      });
    });
  }

  /* ---------- Vista Contenido ---------- */

  function renderContenido() {
    const t = todayISO();
    const all = visibleContents()
      .filter(c => ui.filterState === "all" || c.state === ui.filterState)
      .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));

    const filters = [{ id: "all", label: "Todos" }, ...STATES];
    const filtersHTML = `
      <div class="filters">
        ${filters.map(f => `
          <button class="filter-chip ${ui.filterState === f.id ? "active" : ""}" data-filter="${f.id}">
            ${esc(f.label)}
          </button>`).join("")}
      </div>`;

    // Agrupar por franja temporal
    const groups = [
      { key: "overdue", label: "Atrasados", test: c => isOverdue(c) },
      { key: "today", label: "Hoy", test: c => c.date === t && !isOverdue(c) },
      { key: "week", label: "Esta semana", test: c => c.date && c.date > t && daysBetween(t, c.date) <= 6 },
      { key: "later", label: "Más adelante", test: c => c.date && daysBetween(t, c.date) > 6 },
      { key: "nodate", label: "Sin fecha", test: c => !c.date },
      { key: "past", label: "Publicados anteriores", test: () => true },
    ];
    const bucketed = new Map(groups.map(g => [g.key, []]));
    all.forEach(c => {
      const g = groups.find(g => g.test(c));
      bucketed.get(g.key).push(c);
    });

    const card = c => {
      const b = brandById(c.brandId);
      const next = nextState(c.state);
      return `
      <div class="content-card" style="--item-brand:${b.color}" data-open="${c.id}">
        <div class="content-card-top">
          <div>
            <div class="content-card-title">${esc(c.title)}</div>
            ${c.copy ? `<div class="content-card-copy">${esc(c.copy)}</div>` : ""}
          </div>
          <div class="card-actions">
            ${stateBadge(c.state)}
          </div>
        </div>
        <div class="content-card-meta">
          ${ui.brand === "all" ? `<span class="meta-chip brand-tag">${esc(b.name)}</span>` : ""}
          <span class="meta-chip">${FORMAT_LABEL[c.format]}</span>
          ${c.pillar ? `<span class="meta-chip">${esc(c.pillar)}</span>` : ""}
          ${c.date ? `<span class="${isOverdue(c) ? "overdue-tag" : ""}">${fmtShort(c.date)}${isOverdue(c) ? " · atrasado" : ""}</span>` : ""}
          ${next ? `<button class="advance-btn" style="margin-left:auto" data-advance="${c.id}">
            ${esc(STATE_LABEL[next])}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>` : ""}
        </div>
      </div>`;
    };

    const listHTML = all.length === 0
      ? `<div class="empty-list">
          <div class="serif">Nada por acá</div>
          <p>Creá tu primer contenido con el botón +</p>
        </div>`
      : groups.map(g => {
          const items = bucketed.get(g.key);
          if (!items.length) return "";
          return `
            <div class="date-group-label ${g.key === "overdue" ? "overdue" : ""}">${g.label}</div>
            ${items.map(card).join("")}`;
        }).join("");

    const brandName = ui.brand === "all" ? "Todas las marcas" : brandById(ui.brand)?.name;

    $("#mainView").innerHTML = `
      <h1 class="section-title">Contenido</h1>
      <p class="section-sub">${esc(brandName)} · ${all.length} pieza${all.length !== 1 ? "s" : ""}</p>
      ${filtersHTML}
      ${listHTML}
    `;

    bindCommon($("#mainView"));
    $("#mainView").querySelectorAll("[data-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        ui.filterState = btn.dataset.filter;
        render();
      });
    });
  }

  /* Clicks compartidos: abrir editor / avanzar estado */
  function bindCommon(root) {
    root.querySelectorAll("[data-advance]").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        advanceState(btn.dataset.advance);
      });
    });
    root.querySelectorAll("[data-open]").forEach(el => {
      el.addEventListener("click", () => openEditor(el.dataset.open));
    });
  }

  function advanceState(id) {
    const c = db.contents.find(x => x.id === id);
    if (!c) return;
    const next = nextState(c.state);
    if (!next) return;
    c.state = next;
    c.updatedAt = Date.now();
    persist();
    toast(`${c.title} → ${STATE_LABEL[next]}`);
    render();
  }

  /* ---------- Editor (modal) ---------- */

  const backdrop = $("#modalBackdrop");
  const form = $("#contentForm");

  function openEditor(id) {
    const editing = id ? db.contents.find(c => c.id === id) : null;
    $("#modalTitle").textContent = editing ? "Editar contenido" : "Nuevo contenido";
    $("#btnDelete").hidden = !editing;
    $("#fId").value = editing ? editing.id : "";

    // Marcas (radio con color)
    const selectedBrand = editing ? editing.brandId
      : (ui.brand !== "all" ? ui.brand : db.brands[0].id);
    $("#fBrand").innerHTML = db.brands.map(b => `
      <label>
        <input type="radio" name="brand" value="${b.id}" ${b.id === selectedBrand ? "checked" : ""} />
        <span class="opt" style="--opt-color:${b.color}">
          <span class="dot" style="background:${b.color}"></span>${esc(b.name)}
        </span>
      </label>`).join("");

    // Estados (radio con color)
    const selectedState = editing ? editing.state : "idea";
    $("#fState").innerHTML = STATES.map(s => `
      <label>
        <input type="radio" name="state" value="${s.id}" ${s.id === selectedState ? "checked" : ""} />
        <span class="opt" style="--opt-color:var(--st-${s.id}); --opt-bg:var(--st-${s.id}-bg)">${esc(s.label)}</span>
      </label>`).join("");

    // Formatos
    $("#fFormat").innerHTML = FORMATS.map(f =>
      `<option value="${f.id}" ${editing && editing.format === f.id ? "selected" : ""}>${esc(f.label)}</option>`).join("");

    $("#fTitle").value = editing ? editing.title : "";
    $("#fDate").value = editing ? (editing.date || "") : todayISO();
    $("#fCopy").value = editing ? editing.copy : "";
    $("#fNotes").value = editing ? editing.notes : "";

    refreshPillars(selectedBrand, editing ? editing.pillar : null);

    // los pilares dependen de la marca elegida
    $("#fBrand").querySelectorAll("input").forEach(r => {
      r.addEventListener("change", () => refreshPillars(r.value, null));
    });

    backdrop.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function refreshPillars(brandId, selected) {
    const b = brandById(brandId);
    const pillars = b ? b.pillars : [];
    $("#fPillar").innerHTML =
      `<option value="">— Sin pilar —</option>` +
      pillars.map(p => `<option value="${esc(p)}" ${p === selected ? "selected" : ""}>${esc(p)}</option>`).join("");
  }

  function closeEditor() {
    backdrop.hidden = true;
    document.body.style.overflow = "";
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const id = $("#fId").value;
    const data = {
      brandId: form.querySelector('input[name="brand"]:checked').value,
      title: $("#fTitle").value.trim(),
      date: $("#fDate").value || "",
      format: $("#fFormat").value,
      pillar: $("#fPillar").value,
      state: form.querySelector('input[name="state"]:checked').value,
      copy: $("#fCopy").value.trim(),
      notes: $("#fNotes").value.trim(),
      updatedAt: Date.now(),
    };
    if (!data.title) return;

    if (id) {
      const c = db.contents.find(x => x.id === id);
      Object.assign(c, data);
      toast("Contenido actualizado");
    } else {
      db.contents.push({ id: uid(), createdAt: Date.now(), ...data });
      toast("Contenido creado");
    }
    persist();
    closeEditor();
    render();
  });

  $("#btnDelete").addEventListener("click", () => {
    const id = $("#fId").value;
    const c = db.contents.find(x => x.id === id);
    if (!c) return;
    if (!confirm(`¿Eliminar "${c.title}"?`)) return;
    db.contents = db.contents.filter(x => x.id !== id);
    persist();
    closeEditor();
    toast("Contenido eliminado");
    render();
  });

  $("#modalClose").addEventListener("click", closeEditor);
  backdrop.addEventListener("click", e => {
    if (e.target === backdrop) closeEditor();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !backdrop.hidden) closeEditor();
  });

  $("#fabNew").addEventListener("click", () => openEditor(null));

  /* ---------- Toast ---------- */

  let toastTimer = null;
  function toast(msg) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  /* ---------- Navegación ---------- */

  document.querySelectorAll(".bottomnav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      ui.view = btn.dataset.view;
      render();
    });
  });

  /* ---------- Render raíz ---------- */

  function render() {
    renderBrandSelector();
    document.querySelectorAll(".bottomnav-btn").forEach(b =>
      b.classList.toggle("active", b.dataset.view === ui.view));
    if (ui.view === "panel") renderPanel();
    else renderContenido();
    window.scrollTo({ top: 0 });
  }

  render();
})();
